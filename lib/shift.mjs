// Shift boundaries use Dominican local time, regardless of device timezone.
export function currentShift(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santo_Domingo', hour: '2-digit', hourCycle: 'h23',
  }).format(date));
  return hour >= 6 && hour < 15 ? '1' : hour >= 15 && hour < 23 ? '2' : '3';
}
