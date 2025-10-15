import React from "react";

export function RouteList({ result }: { result: any }) {
  const { best, alternatives } = result;
  if (!best) return <p>적절한 노선을 찾지 못했습니다.</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-2">🚀 가장 빠른 도착 경로</h2>
      <div className="border p-3 rounded-lg bg-blue-50 mb-4">
        <p>노선: {best.origin} → {best.destination}</p>
        <p>운수회사: {best.company} / 등급: {best.grade}</p>
        <p>총 소요시간: 약 {Math.round(best.total_time_min)}분</p>
        <p>출발 예정: {best.next_departure}</p>
      </div>

      <h3 className="text-md font-semibold mb-1">대안 경로</h3>
      <ul className="space-y-2">
        {alternatives.map((alt: any, i: number) => (
          <li key={i} className="border p-3 rounded-lg">
            <p>{alt.origin} → {alt.destination}</p>
            <p>{alt.company} / {alt.grade}</p>
            <p>약 {Math.round(alt.total_time_min)}분</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
