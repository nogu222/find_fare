import { NextResponse } from "next/server";
import { buildRoundTripUrl, findLowestRoundTrip } from "../../../lib/serpapi.js";

const airportPattern = /^[A-Z]{3}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { code: "KEY_MISSING", message: "SERPAPI_KEY가 실행 환경에 연결되지 않았습니다. Secret을 저장한 뒤 새 작업을 시작해 주세요." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_INPUT", message: "요청 형식을 확인해 주세요." }, { status: 400 });
  }

  const origin = String(body.origin || "").trim().toUpperCase();
  const destination = String(body.destination || "").trim().toUpperCase();
  const departureDate = String(body.departureDate || "");
  const returnDate = String(body.returnDate || "");

  if (
    !airportPattern.test(origin) ||
    !airportPattern.test(destination) ||
    origin === destination ||
    !datePattern.test(departureDate) ||
    !datePattern.test(returnDate) ||
    returnDate <= departureDate
  ) {
    return NextResponse.json({ code: "INVALID_INPUT", message: "공항과 날짜 입력값을 확인해 주세요." }, { status: 400 });
  }

  const url = buildRoundTripUrl({ origin, destination, departureDate, returnDate, apiKey });

  let response;
  try {
    response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  } catch {
    return NextResponse.json({ code: "API_ERROR", message: "SerpApi에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    return NextResponse.json({ code: "API_ERROR", message: "SerpApi 응답을 읽지 못했습니다." }, { status: 502 });
  }

  if (response.status === 429) {
    return NextResponse.json({ code: "API_LIMIT", message: "SerpApi 호출 한도에 도달했습니다." }, { status: 429 });
  }
  if (!response.ok || payload?.error) {
    const credentialError = response.status === 401 || response.status === 403;
    return NextResponse.json(
      {
        code: credentialError ? "API_KEY_ERROR" : "API_ERROR",
        message: credentialError ? "SerpApi API Key를 확인해 주세요." : payload?.error || "SerpApi 검색에 실패했습니다.",
      },
      { status: credentialError ? 401 : 502 },
    );
  }

  const result = findLowestRoundTrip(payload);
  if (!result) {
    return NextResponse.json({ code: "NO_RESULT", message: "조건에 맞는 가격 결과가 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    status: "success",
    route: [origin, destination, origin],
    cabin: "Business",
    apiCalls: 1,
    ...result,
  });
}
