import { DEFAULT_DEPARTURE_BUFFER_MIN } from './constants';
import type { Route, Schedule } from './types';

export function normaliseText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

export function parseDepartureTime(value: string): { hours: number; minutes: number } | null {
  const match = value.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return { hours, minutes };
}

export function getNextDepartures(
  schedules: Schedule[],
  route: Route,
  requestedDate = new Date(),
  limit = 5,
): Array<{ schedule: Schedule; departureDate: string; arrivalDate: string }> {
  const now = requestedDate;
  const sorted = schedules
    .map((schedule) => {
      const parsed = parseDepartureTime(schedule.departure_time);
      if (!parsed) {
        return null;
      }
      const departure = new Date(now);
      departure.setHours(parsed.hours, parsed.minutes, 0, 0);
      if (departure.getTime() < now.getTime() + DEFAULT_DEPARTURE_BUFFER_MIN * 60 * 1000) {
        departure.setDate(departure.getDate() + 1);
      }
      const arrival = new Date(departure.getTime() + route.duration_min * 60 * 1000);
      return {
        schedule,
        departureDate: departure.toISOString(),
        arrivalDate: arrival.toISOString(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a!.departureDate).getTime() - new Date(b!.departureDate).getTime());

  return sorted.slice(0, limit) as Array<{
    schedule: Schedule;
    departureDate: string;
    arrivalDate: string;
  }>;
}

export function getRouteMatch(
  routes: Route[],
  origin: string,
  destination: string,
): Route | null {
  const targetOrigin = normaliseText(origin);
  const targetDestination = normaliseText(destination);

  return (
    routes.find(
      (route) =>
        normaliseText(route.origin_name) === targetOrigin &&
        normaliseText(route.destination_name) === targetDestination,
    ) ?? null
  );
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}시간 ${remainder}분` : `${hours}시간`;
}
