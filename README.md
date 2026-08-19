# Business Fare Scanner V0.1

일반 비즈니스 왕복보다 저렴한 하나의 다구간(Multi-city) 운임이 있는지 비교하기 위한 개인용 실험 프로젝트입니다.

프로젝트 전체 목적, 제한사항, 안전 원칙은 [`PROJECT_REQUIREMENTS.md`](./PROJECT_REQUIREMENTS.md)를 기준으로 합니다. 새 Codex 작업은 이 문서와 `IMPLEMENTATION_PLAN.md`를 먼저 읽어야 합니다.

## 현재 범위

- 출발/목적 공항, 날짜, 추가 도시 입력 화면
- 공항 코드와 추가 도시 개수의 브라우저 검증
- Business 좌석 등급 고정 표시
- SerpApi를 통한 기준 Business 왕복 최저가 1건 조회
- 실제 응답의 총 비행시간과 구간별 좌석등급 표시
- 다구간 비교는 다음 단계에서 연결합니다.

## Codex 클라우드에서 실행

```bash
npm install
npm run dev
```

표시되는 주소(보통 `http://localhost:3000`)를 Codex의 포트 미리보기로 열면 됩니다.

## API 키 안전 원칙

실제 키는 코드나 GitHub 저장소에 올리지 않습니다. `.env.example`은 필요한 변수 이름만 보여주는 견본입니다. SerpApi 연결 단계에서 Codex 또는 GitHub의 안전한 비밀 보관함(Secret)에 `SERPAPI_KEY`라는 이름으로 저장할 예정입니다.

Secret을 새로 등록한 경우 이미 실행 중인 작업에는 보이지 않을 수 있으므로 새 Codex 작업을 시작하거나 실행 환경을 다시 시작하세요. 키가 없더라도 앱은 중단되지 않고 설정 안내 오류를 표시합니다.

## 구현 로드맵

상세 단계와 확인 기준은 [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)를 참고하세요.
