const bcrypt = require('bcrypt');
const saltRounds = 10;
export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    return hash;
  } catch (e) {
    console.error('Error hashing password:', e);
    return null;
  }
};

export const comparePasswordHelper = async (
  plainPassword: string,
  hashedPassword: string,
) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (e) {
    console.error('Error compare password:', e);
    return null;
  }
};
