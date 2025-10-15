import React, { useEffect, useState } from "react";
import { RouteList } from "../components/RouteList";
import { MapView } from "../components/MapView";

export default function Result() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("eta_result");
    if (data) setResult(JSON.parse(data));
  }, []);

  if (!result) return <div className="p-6 text-center">결과 데이터를 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold mb-4 text-blue-600">📍 경로 결과</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MapView route={result.best} />
        <RouteList result={result} />
      </div>
      <a
        href="/"
        className="inline-block mt-8 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        다시 계산하기
      </a>
    </div>
  );
}
