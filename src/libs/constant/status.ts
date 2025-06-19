export enum INTERVIEW_SLOT_STATUS {
  AVAILABLE = 'available', // Chưa có ai đăng ký
  BOOKED = 'booked', // Đã đăng ký và chưa diễn ra
  CANCELED_LATE = 'canceled_late', // Hủy trễ (<48h), có vi phạm
  CANCELED = 'canceled', // Hủy bởi mentor
  DONE = 'done', // Đã phỏng vấn
  WAITING = 'waiting', //Đang có candidate đang ký
}

export enum INTERVIEW_SESSION_STATUS {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  DONE = 'done',
  CANCELED = 'canceled',
}
