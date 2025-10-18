export interface Terminal {
  id: string;
  name: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface Route {
  id: string;
  origin_id: string;
  origin_name: string;
  origin_lat?: number | null;
  origin_lng?: number | null;
  destination_id: string;
  destination_name: string;
  destination_lat?: number | null;
  destination_lng?: number | null;
  duration_min: number;
  distance_km: number;
  price_adult: number;
  price_child: number;
  price_youth: number;
  company: string;
  grade: string;
}

export interface Schedule {
  id: string;
  route_id: string;
  departure_time: string; // HH : mm
}

export interface EtaQuery {
  origin: string;
  destination: string;
  departureTime?: string;
}

export interface EtaResponse {
  route: Route;
  nextDepartures: Array<{
    schedule: Schedule;
    departureDate: string;
    arrivalDate: string;
  }>;
  totalDurationMinutes: number;
  distanceKm: number;
}

export interface EtaErrorResponse {
  error: string;
}

export interface BusStopMatch {
  type: 'terminal' | 'route';
  id: string;
  name: string;
  routeId?: string;
}

export interface ReverseEtaResult {
  summary: EtaResponse;
  path?: any;
}
