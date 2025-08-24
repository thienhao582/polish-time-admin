// Utility functions for time calculations

export function calculateEndTime(startTime: string, duration: string, extraTime?: number): string {
  // Parse start time
  const [startHour, startMinute] = startTime.split(':').map(Number);
  
  // Parse duration (assumes format like "90 phút" or "60 phút")
  const durationMatch = duration.match(/(\d+)/);
  if (!durationMatch) return startTime;
  
  const durationMinutes = parseInt(durationMatch[1]);
  const totalMinutes = durationMinutes + (extraTime || 0);
  
  // Calculate end time
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = startTotalMinutes + totalMinutes;
  
  const endHour = Math.floor(endTotalMinutes / 60);
  const endMinute = endTotalMinutes % 60;
  
  // Format as HH:MM
  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

export function formatTimeRange(startTime: string, duration: string, extraTime?: number): string {
  // Format start time to HH:MM (remove seconds if present)
  const formattedStartTime = startTime.substring(0, 5);
  const endTime = calculateEndTime(formattedStartTime, duration, extraTime);
  return `${formattedStartTime} - ${endTime}`;
}

// Generate time options with 15-minute intervals
export function generateTimeOptions(): string[] {
  const times: string[] = [];
  
  // From 8:00 to 22:45 (8 AM to 10:45 PM)
  for (let hour = 8; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 22 && minute > 45) break; // Stop at 22:45
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  
  return times;
}