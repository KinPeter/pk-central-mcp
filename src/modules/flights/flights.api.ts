import { apiFetch } from '../../api-client.js';

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Aircraft {
  icao: string;
  name: string;
}

export interface Airline {
  iata: string;
  icao: string;
  name: string;
}

export type SeatType = 'Aisle' | 'Middle' | 'Window';
export type FlightClass = 'Economy' | 'Premium Economy' | 'Business' | 'First';
export type FlightReason = 'Leisure' | 'Business' | 'Crew';

export interface Flight {
  id: string;
  flightNumber: string;
  date: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: number;
  airline: Airline;
  aircraft: Aircraft;
  registration?: string | null;
  seatNumber?: string | null;
  seatType?: SeatType | null;
  flightClass?: FlightClass | null;
  flightReason?: FlightReason | null;
  note?: string | null;
  isPlanned: boolean;
}

export interface FlightRequest {
  flightNumber: string;
  date: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: number;
  airline: Airline;
  aircraft: Aircraft;
  registration?: string | null;
  seatNumber?: string | null;
  seatType?: SeatType | null;
  flightClass?: FlightClass | null;
  flightReason?: FlightReason | null;
  note?: string | null;
  isPlanned?: boolean;
}

export interface FlightQuery {
  year?: string[];
  isPlanned?: boolean;
  flightClass?: FlightClass[];
  flightReason?: FlightReason[];
  seatType?: SeatType[];
  airlineIata?: string[];
  aircraftIcao?: string[];
  distanceGt?: number;
  distanceLt?: number;
  city?: string[];
  country?: string[];
  airportIata?: string[];
  toCity?: string[];
  toCountry?: string[];
  toAirportIata?: string[];
  fromCity?: string[];
  fromCountry?: string[];
  fromAirportIata?: string[];
}

export async function listFlights(): Promise<Flight[]> {
  const res = await apiFetch<{ entities: Flight[] }>('/flights/');
  return res.entities;
}

export async function createFlight(data: FlightRequest): Promise<Flight> {
  return apiFetch<Flight>('/flights/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFlight(id: string, data: FlightRequest): Promise<Flight> {
  return apiFetch<Flight>(`/flights/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFlight(id: string): Promise<void> {
  await apiFetch<{ id: string }>(`/flights/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function queryFlights(query: FlightQuery): Promise<Flight[]> {
  const res = await apiFetch<{ entities: Flight[] }>('/flights/query', {
    method: 'POST',
    body: JSON.stringify(query),
  });
  return res.entities;
}
