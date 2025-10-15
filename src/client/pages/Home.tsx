import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";

export default function Home() {
  const [pickup, setPickup] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  const handleCalculate = async () => {
    if (!pickup || !destination) return alert("출발지와 도착지를 모두 선택하세요!");

    const res = await fetch("/api/eta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pickup, destination }),
    });
    const data = await res.json();
    localStorage.setItem("eta_result", JSON.stringify(data));
    navigate("/result");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">NeoQik Reverse ETA</h1>
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4">
        <SearchBox label="출발지" onSelect={setPickup} />
        <SearchBox label="도착지" onSelect={setDestination} />
        <button
          onClick={handleCalculate}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
        >
          지금 출발하면 얼마나 걸릴까?
        </button>
      </div>
      <footer className="mt-8 text-sm text-gray-500">
        Powered by Naver Maps · JUSO API · Cloudflare Pages
      </footer>
    </div>
  );
}
