"use client";

import { useState } from "react";

const airportPattern = /^[A-Z]{3}$/;

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const origin = String(data.get("origin") ?? "").trim().toUpperCase();
    const destination = String(data.get("destination") ?? "").trim().toUpperCase();
    const departureDate = String(data.get("departureDate") ?? "");
    const returnDate = String(data.get("returnDate") ?? "");
    const cities = String(data.get("cities") ?? "")
      .split(/[\s,]+/)
      .map((city) => city.trim().toUpperCase())
      .filter(Boolean);

    if (![origin, destination, ...cities].every((code) => airportPattern.test(code))) {
      setMessage("공항 코드는 ICN처럼 영문 3글자로 입력해 주세요.");
      return;
    }
    if (cities.length > 10) {
      setMessage("API 호출량을 보호하기 위해 추가 도시는 한 번에 최대 10개까지 입력해 주세요.");
      return;
    }
    if (returnDate <= departureDate) {
      setMessage("귀국일은 출국일보다 뒤여야 합니다.");
      return;
    }

    setLoading(true);
    setResult(null);
    setMessage("기준 Business 왕복 최저가를 검색하고 있습니다…");
    try {
      const response = await fetch("/api/baseline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, departureDate, returnDate }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(`${payload.code || "API_ERROR"}: ${payload.message || "검색에 실패했습니다."}`);
        return;
      }
      setResult(payload);
      setMessage(`검색 성공 · SerpApi 호출 ${payload.apiCalls}회`);
    } catch {
      setMessage("API_ERROR: 서버 응답을 읽지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="eyebrow">PERSONAL EXPERIMENT · V0.1</div>
        <h1>Business Fare Scanner</h1>
        <p>
          일반 왕복보다 저렴한 비즈니스석 다구간 운임이 있는지 비교하기 위한 실험판입니다.
        </p>
      </section>

      <section className="card" aria-labelledby="search-title">
        <div className="section-heading">
          <div>
            <span className="step">STEP 1</span>
            <h2 id="search-title">검색 조건 입력</h2>
          </div>
          <span className="cabin">좌석 등급 · Business 고정</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid">
            <label>
              출발공항
              <input name="origin" defaultValue="ICN" maxLength={3} required aria-describedby="airport-help" />
            </label>
            <label>
              목적공항
              <input name="destination" defaultValue="CDG" maxLength={3} required aria-describedby="airport-help" />
            </label>
            <label>
              출국일
              <input name="departureDate" type="date" defaultValue="2026-10-10" required />
            </label>
            <label>
              귀국일
              <input name="returnDate" type="date" defaultValue="2026-10-20" required />
            </label>
          </div>
          <p id="airport-help" className="help">공항 코드는 영문 3글자로 입력합니다. 예: ICN, CDG</p>

          <label className="cities-label">
            추가로 시험할 도시
            <textarea name="cities" defaultValue={"HEL\nIST\nMAD\nFCO\nLIS"} rows={5} required />
          </label>
          <p className="help">쉼표, 띄어쓰기 또는 줄바꿈으로 구분하세요. 호출량 보호를 위해 최대 10개입니다.</p>

          <button type="submit" disabled={loading}>{loading ? "검색 중…" : "기준 왕복 검색하기"}</button>
        </form>

        {message && <div className="notice" role="status">{message}</div>}
        {result && (
          <article className="result" aria-label="기준 왕복 검색 결과">
            <div>
              <span className="step">기준 왕복 · {result.cabin}</span>
              <h3>{result.route.join(" → ")}</h3>
            </div>
            <strong className="price">{new Intl.NumberFormat("ko-KR").format(result.price)} {result.currency}</strong>
            <p>총 비행시간: {result.totalDuration ? `${Math.floor(result.totalDuration / 60)}시간 ${result.totalDuration % 60}분` : "정보 없음"}</p>
            <ul>
              {result.segments.map((segment, index) => (
                <li key={`${segment.flightNumber}-${index}`}>
                  {segment.departure || "?"} → {segment.arrival || "?"} · {segment.airline || "항공사 정보 없음"} {segment.flightNumber || ""} · {segment.travelClass || "좌석등급 정보 없음"}
                </li>
              ))}
            </ul>
          </article>
        )}
      </section>

      <section className="status-card">
        <strong>현재 구현 단계</strong>
        <p>기준 Business 왕복 가격 1건을 SerpApi로 조회합니다. 다구간 비교는 다음 단계에서 연결합니다.</p>
      </section>
    </main>
  );
}
