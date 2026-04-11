import { apiFetch } from '../../api-client.js';

export interface FlightStats {
  totalCount: number;
  domesticCount: number;
  intlCount: number;
  totalDistance: number;
  totalDurationMinutes: number;
  flightClassesByCount: [string, number][];
  reasonsByCount: [string, number][];
  seatTypeByCount: [string, number][];
  continentsByCount: [string, number][];
  totalCountries: number;
  countriesByCount: [string, number][];
  totalAirports: number;
  airportsByCount: [string, number][];
  totalAirlines: number;
  airlinesByCount: [string, number][];
  airlinesByDistance: [string, number][];
  totalAircrafts: number;
  aircraftByCount: [string, number][];
  aircraftByDistance: [string, number][];
  totalRoutes: number;
  routesByCount: [string, number][];
  routesByDistance: [string, number][];
  flightsPerYear: [string, number][];
  distancePerYear: [string, number][];
  flightsPerMonth: [string, number][];
  flightsPerWeekday: [string, number][];
  airportsMap: Record<string, string>;
  airlinesMap: Record<string, string>;
  aircraftMap: Record<string, string>;
  years: string[];
}

export interface VisitStats {
  citiesCount: number;
  countriesCount: number;
}

export interface TripsStats {
  flights: FlightStats;
  visits: VisitStats;
}

export interface TripsStatsRequest {
  year?: string[];
  flightIds?: string[];
  visitIds?: string[];
}

export async function getTripsStats(body: TripsStatsRequest): Promise<TripsStats> {
  return apiFetch<TripsStats>('/trips/stats', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
