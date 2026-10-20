export function registrationDeadline(eventDate: string) {
  return new Date(`${eventDate}T12:00:00+09:00`);
}

export function isRegistrationOpen(eventDate: string, manuallyOpen: boolean, now = new Date()) {
  if (!manuallyOpen) return false;
  const deadline = registrationDeadline(eventDate);
  return !Number.isNaN(deadline.getTime()) && now.getTime() < deadline.getTime();
}
