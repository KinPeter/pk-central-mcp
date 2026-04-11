import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  listFlights,
  createFlight,
  updateFlight,
  deleteFlight,
  queryFlights,
  Flight,
} from './flights.api.js';

function formatFlight(f: Flight): string {
  const route = `${f.departureAirport.iata} (${f.departureAirport.city}, ${f.departureAirport.country}) → ${f.arrivalAirport.iata} (${f.arrivalAirport.city}, ${f.arrivalAirport.country})`;
  const cabin = [f.flightClass, f.seatType].filter(Boolean).join(', ');
  const status = f.isPlanned ? 'planned' : 'completed';
  const extra = [
    f.registration ? `reg: ${f.registration}` : null,
    f.seatNumber ? `seat: ${f.seatNumber}` : null,
    f.flightReason ? `reason: ${f.flightReason}` : null,
    f.note ? `note: ${f.note}` : null,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    `- ID: ${f.id} | ${f.flightNumber} | ${f.date} | ${route} | ` +
    `${f.airline.name} (${f.airline.iata}) | ${f.aircraft.name} (${f.aircraft.icao}) | ` +
    `${cabin} | ${f.distance}km | dep: ${f.departureTime} arr: ${f.arrivalTime} dur: ${f.duration} | ${status}` +
    (extra ? ` | ${extra}` : '')
  );
}

const airportSchema = z.object({
  iata: z.string().length(3).describe('3-letter IATA airport code, e.g. "CDG", "JFK", "ICN"'),
  icao: z.string().length(4).describe('4-letter ICAO airport code, e.g. "LFPG", "KJFK", "RKSI"'),
  name: z.string().describe('Full airport name, e.g. "Charles de Gaulle"'),
  city: z.string().describe('City the airport serves, e.g. "Paris"'),
  country: z.string().describe('Country the airport is in, e.g. "France"'),
  lat: z.number().min(-90).max(90).describe('Latitude of the airport'),
  lng: z.number().min(-180).max(180).describe('Longitude of the airport'),
});

const airlineSchema = z.object({
  iata: z.string().length(2).describe('2-character IATA airline code, e.g. "LH", "FR", "TK"'),
  icao: z.string().length(3).describe('3-character ICAO airline code, e.g. "DLH", "RYR", "THY"'),
  name: z.string().describe('Full airline name, e.g. "Lufthansa"'),
});

const aircraftSchema = z.object({
  icao: z.string().min(2).max(4).describe('ICAO aircraft type code, e.g. "B738", "A320", "A35K"'),
  name: z.string().describe('Aircraft type name, e.g. "Boeing 737-800", "Airbus A320"'),
});

const flightRequestSchema = {
  flightNumber: z
    .string()
    .min(3)
    .max(7)
    .describe('Flight number including airline prefix, e.g. "LH123", "FR4021"'),
  date: z
    .string()
    .regex(/^([2-9]\d{3}|19\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
    .describe('Flight date in YYYY-MM-DD format, e.g. "2024-08-10"'),
  departureAirport: airportSchema.describe('Departure airport details'),
  arrivalAirport: airportSchema.describe('Arrival airport details'),
  departureTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .describe('Scheduled departure time in HH:MM format (local), e.g. "10:35"'),
  arrivalTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .describe('Scheduled arrival time in HH:MM format (local), e.g. "14:05"'),
  duration: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .describe('Total flight duration in HH:MM format, e.g. "02:30", "11:45"'),
  distance: z.number().positive().describe('Great-circle distance in kilometres, e.g. 1200.5'),
  airline: airlineSchema.describe('Operating airline'),
  aircraft: aircraftSchema.describe('Aircraft type flown'),
  registration: z
    .string()
    .min(3)
    .max(10)
    .optional()
    .describe('Aircraft registration (tail number), e.g. "D-AIMA", "EI-DCL"'),
  seatNumber: z.string().min(1).max(3).optional().describe('Seat number, e.g. "12A", "34C"'),
  seatType: z
    .enum(['Aisle', 'Middle', 'Window'])
    .optional()
    .describe('Seat position type: "Aisle", "Middle", or "Window". Defaults to "Aisle"'),
  flightClass: z
    .enum(['Economy', 'Premium Economy', 'Business', 'First'])
    .optional()
    .describe(
      'Cabin class: "Economy", "Premium Economy", "Business", or "First". Defaults to "Economy"',
    ),
  flightReason: z
    .enum(['Leisure', 'Business', 'Crew'])
    .optional()
    .describe('Purpose of travel: "Leisure", "Business", or "Crew". Defaults to "Leisure"'),
  note: z.string().max(100).optional().describe('Optional personal note about the flight'),
  isPlanned: z
    .boolean()
    .optional()
    .describe('True if this is an upcoming/planned flight, false (default) if already flown'),
};

export function registerFlightsTools(server: McpServer) {
  server.registerTool(
    'list-flights',
    {
      description: 'List all flight entries saved for the user (both completed and planned).',
      inputSchema: {},
    },
    async () => {
      const flights = await listFlights();

      if (flights.length === 0) {
        return { content: [{ type: 'text', text: 'No flights found.' }] };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Found ${flights.length} flight(s):\n${flights.map(formatFlight).join('\n')}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'create-flight',
    {
      description:
        'Create a new flight entry. Provide full details for the departure and arrival airports, ' +
        'operating airline, and aircraft type — all require structured objects with IATA/ICAO codes, ' +
        'name, city, country, and coordinates. Use accurate codes: airport IATA is 3 letters (e.g. "CDG"), ' +
        'airline IATA is 2 characters (e.g. "LH"), aircraft ICAO is 2-4 characters (e.g. "B738"). ' +
        'Times are in HH:MM local time. Distance is in kilometres.',
      inputSchema: flightRequestSchema,
    },
    async (input) => {
      const flight = await createFlight(input);

      return {
        content: [
          {
            type: 'text',
            text: `Flight created successfully.\n${formatFlight(flight)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'update-flight',
    {
      description:
        'Update an existing flight entry by its ID. All fields are replaced — use "list-flights" ' +
        'or "query-flights" first to retrieve the current values if you need to preserve any of them.',
      inputSchema: {
        id: z.string().describe('The flight ID to update'),
        ...flightRequestSchema,
      },
    },
    async ({ id, ...rest }) => {
      const flight = await updateFlight(id, rest);

      return {
        content: [
          {
            type: 'text',
            text: `Flight updated successfully.\n${formatFlight(flight)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'delete-flight',
    {
      description:
        'Permanently delete a flight entry by its ID. This action cannot be undone — always ask for confirmation before proceeding.',
      inputSchema: {
        id: z.string().describe('The flight ID to delete'),
      },
    },
    async ({ id }) => {
      await deleteFlight(id);

      return {
        content: [{ type: 'text', text: `Flight ${id} deleted successfully.` }],
      };
    },
  );

  server.registerTool(
    'query-flights',
    {
      description:
        'Query flights with optional filters. All filters are combined (AND logic). ' +
        'If no filters are provided, all flights are returned. ' +
        'Filter groups:\n' +
        '- Date: year (e.g. ["2024"] or ["2023","2024"] — matched from the date field)\n' +
        '- Status: isPlanned (true = upcoming, false = completed)\n' +
        '- Cabin: flightClass, flightReason, seatType (enum arrays)\n' +
        '- Carrier: airlineIata (e.g. ["LH","FR"]), aircraftIcao (e.g. ["B738","A320"])\n' +
        '- Distance: distanceGt / distanceLt (in km, can be combined for a range)\n' +
        '- Either direction: city, country, airportIata — match if the city/country/IATA appears in either the departure OR arrival airport\n' +
        '- Arrival only: toCity, toCountry, toAirportIata\n' +
        '- Departure only: fromCity, fromCountry, fromAirportIata',
      inputSchema: {
        year: z
          .array(z.string().regex(/^\d{4}$/))
          .optional()
          .describe('Filter by year(s) of the flight date, e.g. ["2024"] or ["2023","2024"]'),
        isPlanned: z
          .boolean()
          .optional()
          .describe('Filter by planned status: true = upcoming flights, false = completed flights'),
        flightClass: z
          .array(z.enum(['Economy', 'Premium Economy', 'Business', 'First']))
          .optional()
          .describe('Filter by cabin class, e.g. ["Business"] or ["Economy","Premium Economy"]'),
        flightReason: z
          .array(z.enum(['Leisure', 'Business', 'Crew']))
          .optional()
          .describe('Filter by travel reason, e.g. ["Leisure"] or ["Business","Crew"]'),
        seatType: z
          .array(z.enum(['Aisle', 'Middle', 'Window']))
          .optional()
          .describe('Filter by seat type, e.g. ["Window"] or ["Aisle","Window"]'),
        airlineIata: z
          .array(z.string())
          .optional()
          .describe('Filter by airline IATA code(s), e.g. ["LH"] or ["TK","QR"]'),
        aircraftIcao: z
          .array(z.string())
          .optional()
          .describe('Filter by aircraft ICAO type code(s), e.g. ["B738"] or ["A320","A321"]'),
        distanceGt: z
          .number()
          .optional()
          .describe('Return only flights with distance greater than this value (km)'),
        distanceLt: z
          .number()
          .optional()
          .describe('Return only flights with distance less than this value (km)'),
        city: z
          .array(z.string())
          .optional()
          .describe(
            'Filter by city appearing in either departure OR arrival airport, e.g. ["Paris"] or ["Seoul","Busan"]',
          ),
        country: z
          .array(z.string())
          .optional()
          .describe(
            'Filter by country appearing in either departure OR arrival airport, e.g. ["France"] or ["Korea","Japan"]',
          ),
        airportIata: z
          .array(z.string())
          .optional()
          .describe(
            'Filter by IATA code appearing in either departure OR arrival airport, e.g. ["CDG"] or ["ICN","GMP"]',
          ),
        toCity: z
          .array(z.string())
          .optional()
          .describe('Filter by arrival airport city only, e.g. ["Paris"]'),
        toCountry: z
          .array(z.string())
          .optional()
          .describe('Filter by arrival airport country only, e.g. ["France"]'),
        toAirportIata: z
          .array(z.string())
          .optional()
          .describe('Filter by arrival airport IATA code only, e.g. ["CDG"]'),
        fromCity: z
          .array(z.string())
          .optional()
          .describe('Filter by departure airport city only, e.g. ["Dublin"]'),
        fromCountry: z
          .array(z.string())
          .optional()
          .describe('Filter by departure airport country only, e.g. ["Ireland"]'),
        fromAirportIata: z
          .array(z.string())
          .optional()
          .describe('Filter by departure airport IATA code only, e.g. ["DUB"]'),
      },
    },
    async (filters) => {
      const flights = await queryFlights(filters);

      if (flights.length === 0) {
        return { content: [{ type: 'text', text: 'No flights found matching the query.' }] };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Found ${flights.length} flight(s):\n${flights.map(formatFlight).join('\n')}`,
          },
        ],
      };
    },
  );
}
