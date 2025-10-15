import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    naver: any;
  }
}

export function MapView({ route }: { route: any }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!route) return;

    // ✅ Naver Maps SDK 동적 로드
    const existing = document.getElementById("naver-map-sdk");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "naver-map-sdk";
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${import.meta.env.VITE_NAVER_CLIENT_ID}`;
      script.async = true;
      document.head.appendChild(script);
      script.onload = initMap;
    } else {
      initMap();
    }

    function initMap() {
      if (!window.naver) return;
      const { origin_lat, origin_lng, destination_lat, destination_lng } = route;

      const map = new window.naver.maps.Map(mapRef.current!, {
        center: new window.naver.maps.LatLng(
          (origin_lat + destination_lat) / 2,
          (origin_lng + destination_lng) / 2
        ),
        zoom: 8,
      });

      const origin = new window.naver.maps.LatLng(origin_lat, origin_lng);
      const destination = new window.naver.maps.LatLng(destination_lat, destination_lng);

      new window.naver.maps.Marker({ position: origin, map, title: route.origin });
      new window.naver.maps.Marker({ position: destination, map, title: route.destination });

      // 단순 직선 연결 (Directions API는 아래 참고)
      new window.naver.maps.Polyline({
        map,
        path: [origin, destination],
        strokeColor: "#0070f3",
        strokeWeight: 4,
      });
    }
  }, [route]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-xl shadow" />;
}
