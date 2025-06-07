// File: src/helpers/zegocloudAssistant.ts

import { createCipheriv, randomBytes } from 'crypto';

/**
 * Các mã lỗi khi generate token (v4)
 */
enum ErrorCode {
  success = 0,
  appIDInvalid = 1,
  userIDInvalid = 3,
  secretInvalid = 5,
  effectiveTimeInSecondsInvalid = 6,
}

/**
 * Trả về số nguyên ngẫu nhiên trong khoảng [a, b]
 */
function RndNum(a: number, b: number): number {
  return Math.ceil(a + (b - a) * Math.random());
}

/**
 * Tạo ngẫu nhiên một chuỗi IV dài 16 ký tự (0-9, a-z)
 */
function makeRandomIv(): string {
  const str = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 16; i++) {
    const idx = Math.floor(Math.random() * str.length);
    result += str.charAt(idx);
  }
  return result;
}

/**
 * Lựa chọn thuật toán AES (CBC) dựa trên độ dài key (16, 24 hoặc 32 bytes)
 */
function getAlgorithm(keyBase64: string): string {
  const keyBuf = Buffer.from(keyBase64, 'utf8');
  switch (keyBuf.length) {
    case 16:
      return 'aes-128-cbc';
    case 24:
      return 'aes-192-cbc';
    case 32:
      return 'aes-256-cbc';
    default:
      throw new Error(`Invalid key length: ${keyBuf.length}`);
  }
}

/**
 * Mã hóa plainText bằng AES-CBC/PKCS5Padding
 * @param plainText Nội dung JSON (string) cần mã hóa
 * @param key       Chuỗi key gốc (32-byte base64 hoặc hex)
 * @param iv        Chuỗi IV (16 ký tự, ascii)
 * @returns         Uint8Array.buffer chứa dữ liệu đã mã hóa
 */
function aesEncrypt(plainText: string, key: string, iv: string): ArrayBuffer {
  const keyBuf = Buffer.from(key, 'utf8');
  const ivBuf = Buffer.from(iv, 'utf8');
  const algorithm = getAlgorithm(key);
  const cipher = createCipheriv(algorithm, keyBuf, ivBuf);
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  return encrypted.buffer;
}

/**
 * Sinh token Zego Cloud phiên bản v4 (04...)
 *
 * @param appId                 Số App ID (number) bạn lấy từ Zego Dashboard
 * @param userId                Chuỗi định danh user (string)
 * @param secret                Server Secret (chuỗi 32 ký tự) bạn lưu trong .env
 * @param effectiveTimeInSeconds Số giây token còn hiệu lực (tính từ thời điểm hiện tại)
 * @param payload               Chuỗi payload (tuỳ chọn) thường là '' (empty string)
 * @returns                     Token (kiểu string) bắt đầu bằng “04...”
 *
 * Để gọi đúng, bạn phải đảm bảo:
 *  - appId là number hợp lệ
 *  - userId là string (không rỗng)
 *  - secret là string dài đúng 32 ký tự (32 byte)
 *  - effectiveTimeInSeconds là number > 0
 */
export function generateToken04(
  appId: number,
  userId: string,
  secret: string,
  effectiveTimeInSeconds: number,
  payload = '',
): string {
  if (!appId || typeof appId !== 'number') {
    throw {
      errorCode: ErrorCode.appIDInvalid,
      errorMessage: 'appID invalid',
    };
  }
  if (!userId || typeof userId !== 'string') {
    throw {
      errorCode: ErrorCode.userIDInvalid,
      errorMessage: 'userId invalid',
    };
  }
  if (
    !secret ||
    typeof secret !== 'string' ||
    Buffer.from(secret, 'utf8').length !== 32
  ) {
    throw {
      errorCode: ErrorCode.secretInvalid,
      errorMessage: 'secret must be a 32 byte string',
    };
  }
  if (
    !effectiveTimeInSeconds ||
    typeof effectiveTimeInSeconds !== 'number' ||
    effectiveTimeInSeconds <= 0
  ) {
    throw {
      errorCode: ErrorCode.effectiveTimeInSecondsInvalid,
      errorMessage: 'effectiveTimeInSeconds invalid',
    };
  }

  // Thời gian hiện tại (UTC) tính bằng giây
  const createTime = Math.floor(Date.now() / 1000);

  // Tạo object chứa thông tin token
  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: RndNum(-2147483648, 2147483647),
    ctime: createTime,
    expire: createTime + effectiveTimeInSeconds,
    payload,
  };

  // Chuyển đổi tokenInfo thành JSON string
  const plainText = JSON.stringify(tokenInfo);

  // Sinh IV ngẫu nhiên 16 bytes (16 ký tự ascii)
  const iv = makeRandomIv();

  // Mã hóa JSON string bằng AES-CBC/PKCS5Padding
  const encryptBuf = aesEncrypt(plainText, secret, iv);

  // Chuẩn bị các khối nhị phân để đóng gói:
  //  - 8 byte đầu: BigInt64 chứa giá trị expire (kết thúc)
  //  - 2 byte tiếp: độ dài IV ( số byte ), lưu kiểu Uint16 BE
  //  - 16 byte tiếp: nội dung IV (ascii)
  //  - 2 byte tiếp: độ dài encrypted payload, lưu kiểu Uint16 BE
  //  - Cuối cùng: encrypted payload bytes
  const expireBuf = Buffer.allocUnsafe(8);
  expireBuf.writeBigInt64BE(BigInt(tokenInfo.expire), 0);

  const ivLenBuf = Buffer.allocUnsafe(2);
  ivLenBuf.writeUInt16BE(iv.length, 0);

  const ivBuf = Buffer.from(iv, 'utf8'); // buffer của IV

  const payloadLenBuf = Buffer.allocUnsafe(2);
  payloadLenBuf.writeUInt16BE(encryptBuf.byteLength, 0);

  const encryptedFull = Buffer.concat([
    expireBuf,
    ivLenBuf,
    ivBuf,
    payloadLenBuf,
    Buffer.from(encryptBuf),
  ]);

  // Cuối cùng, prepend '04' và encode toàn bộ buffer thành Base64
  const tokenBase64 = Buffer.from(encryptedFull).toString('base64');
  return '04' + tokenBase64;
}
