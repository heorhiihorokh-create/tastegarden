import {
  EMPTY_HOLIDAY_BLOCK_WINDOW,
  isHolidayBlockWindowActive,
  type HolidayBlockWindow,
} from '@/lib/holidayBlockWindow';

export function holidayAnnouncementBlocksReservations(
  holiday: { active: boolean; blockWindow?: HolidayBlockWindow | null },
  now = new Date(),
) {
  if (!holiday.active) return false;
  return isHolidayBlockWindowActive(holiday.blockWindow ?? EMPTY_HOLIDAY_BLOCK_WINDOW, now);
}
