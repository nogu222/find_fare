import "./globals.css";

export const metadata = {
  title: "Business Fare Scanner",
  description: "비즈니스석 다구간 운임 가격 역전 탐색 실험판",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
