const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";

export function buildRoundTripUrl({ origin, destination, departureDate, returnDate, apiKey }) {
  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: origin,
    arrival_id: destination,
    outbound_date: departureDate,
    return_date: returnDate,
    type: "1",
    travel_class: "3",
    adults: "1",
    currency: "KRW",
    hl: "ko",
    api_key: apiKey,
  });

  return `${SERPAPI_ENDPOINT}?${params.toString()}`;
}

export function findLowestRoundTrip(payload) {
  const groups = [payload?.best_flights, payload?.other_flights];
  const flights = groups.flatMap((group) => (Array.isArray(group) ? group : []));
  const priced = flights.filter((flight) => Number.isFinite(flight?.price) && flight.price > 0);

  if (priced.length === 0) return null;

  const lowest = priced.reduce((best, flight) => (flight.price < best.price ? flight : best));
  return {
    price: lowest.price,
    currency: payload?.search_parameters?.currency || "KRW",
    totalDuration: Number.isFinite(lowest.total_duration) ? lowest.total_duration : null,
    segments: Array.isArray(lowest.flights)
      ? lowest.flights.map((segment) => ({
          departure: segment?.departure_airport?.id || null,
          arrival: segment?.arrival_airport?.id || null,
          airline: segment?.airline || null,
          flightNumber: segment?.flight_number || null,
          travelClass: segment?.travel_class || null,
        }))
      : [],
  };
}
