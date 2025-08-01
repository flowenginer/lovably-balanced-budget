// Utility functions for handling dates in Brazilian format without timezone issues

/**
 * Converts a Date object to YYYY-MM-DD format in local timezone
 * This prevents timezone shifting issues when storing dates
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets current date in YYYY-MM-DD format for Brazilian timezone
 */
export function getCurrentDateString(): string {
  return formatDateForInput(new Date());
}

/**
 * Converts a date string (YYYY-MM-DD) to a Date object
 * keeping the exact date without timezone conversion
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}