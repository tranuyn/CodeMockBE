import { Mentor } from 'src/modules/user/entities/mentor.entity';

export function sanitizeMentor(mentor: Mentor): Partial<Mentor> {
  if (!mentor) return null;
  const {
    password,
    code_id,
    code_expired,
    warning_count,
    warning_until,
    lastLogin,
    ...safeMentor
  } = mentor;

  return safeMentor;
}
