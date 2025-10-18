import routes from './seed/routes.json';
import schedules from './seed/schedules.json';
import terminals from './seed/terminals.json';
import type { Route, Schedule, Terminal } from '../shared/types';
import { getRouteMatch, getNextDepartures } from '../shared/utils';
import { MAX_DEPARTURES_RETURNED } from '../shared/constants';

export interface DataStore {
  routes: Route[];
  schedules: Schedule[];
  terminals: Terminal[];
}

const datastore: DataStore = {
  routes: routes as Route[],
  schedules: schedules as Schedule[],
  terminals: terminals as Terminal[],
};

export function findRoute(origin: string, destination: string): Route | null {
  return getRouteMatch(datastore.routes, origin, destination);
}

export function findSchedulesByRoute(routeId: string): Schedule[] {
  return datastore.schedules.filter((schedule) => schedule.route_id === routeId);
}

export function getTerminals(): Terminal[] {
  return datastore.terminals;
}

export function getRoutes(): Route[] {
  return datastore.routes;
}

export function computeEta(origin: string, destination: string, departureTime?: string) {
  const route = findRoute(origin, destination);
  if (!route) {
    return null;
  }

  let referenceDate: Date | undefined;
  if (departureTime) {
    const parsed = new Date(departureTime);
    if (!Number.isNaN(parsed.getTime())) {
      referenceDate = parsed;
    }
  }

  const schedulesForRoute = findSchedulesByRoute(route.id);
  const departures = getNextDepartures(
    schedulesForRoute,
    route,
    referenceDate ?? new Date(),
    MAX_DEPARTURES_RETURNED,
  );

  return {
    route,
    nextDepartures: departures,
    totalDurationMinutes: route.duration_min,
    distanceKm: route.distance_km,
  };
}

export function findTerminalMatches(query: string): Terminal[] {
  const normalised = query.trim().toLowerCase();
  if (!normalised) {
    return [];
  }
  return datastore.terminals
    .filter((terminal) => terminal.name.toLowerCase().includes(normalised))
    .slice(0, 10);
}
