import React, { useState } from "react";

export function SearchBox({
  label,
  onSelect,
}: {
  label: string;
  onSelect: (coords: { lat: number; lng: number }) => void;
}) {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    if (!query) return;
    const res = await fetch(`/api/geo?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data?.results?.[0]) {
      const { lat, lng } = data.results[0];
      onSelect({ lat, lng });
      alert(`${label} 선택됨: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } else {
      alert("검색 결과 없음");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex">
        <input
          className="flex-1 border rounded-l-lg px-3 py-2 outline-none"
          placeholder="주소를 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
        >
          검색
        </button>
      </div>
    </div>
  );
}
