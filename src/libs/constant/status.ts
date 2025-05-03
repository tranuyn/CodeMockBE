export enum INTERVIEW_SLOT_STATUS {
  AVAILABLE = 'available', // Chưa có ai đăng ký
  BOOKED = 'booked', // Đã đăng ký và chưa diễn ra
  CANCELED_LATE = 'canceled_late', // Hủy trễ (<48h), có vi phạm
  DONE = 'done', // Đã phỏng vấn và đánh giá
}
