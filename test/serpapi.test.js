import test from "node:test";
import assert from "node:assert/strict";
import { buildRoundTripUrl, findLowestRoundTrip } from "../lib/serpapi.js";

test("builds a Business round-trip request without losing the API key", () => {
  const url = new URL(buildRoundTripUrl({
    origin: "ICN",
    destination: "CDG",
    departureDate: "2026-10-10",
    returnDate: "2026-10-20",
    apiKey: "secret-value",
  }));
  assert.equal(url.searchParams.get("engine"), "google_flights");
  assert.equal(url.searchParams.get("type"), "1");
  assert.equal(url.searchParams.get("travel_class"), "3");
  assert.equal(url.searchParams.get("currency"), "KRW");
  assert.equal(url.searchParams.get("api_key"), "secret-value");
});

test("selects the lowest positive price and preserves real segment cabin data", () => {
  const result = findLowestRoundTrip({
    search_parameters: { currency: "KRW" },
    best_flights: [{ price: 3810000, total_duration: 900, flights: [] }],
    other_flights: [{
      price: 3500000,
      total_duration: 840,
      flights: [{
        departure_airport: { id: "ICN" },
        arrival_airport: { id: "CDG" },
        airline: "Example Air",
        flight_number: "EA 1",
        travel_class: "Business",
      }],
    }],
  });
  assert.equal(result.price, 3500000);
  assert.equal(result.segments[0].travelClass, "Business");
});

test("returns null instead of inventing a zero price", () => {
  assert.equal(findLowestRoundTrip({ best_flights: [{ price: 0 }] }), null);
  assert.equal(findLowestRoundTrip({}), null);
});
