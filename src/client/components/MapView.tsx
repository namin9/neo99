import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    naver: any;
  }
}

export function MapView({ route }: { route: any }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.naver || !route) return;

    const { origin_lat, origin_lng, destination_lat, destination_lng } = route;

    const map = new window.naver.maps.Map(mapRef.current!, {
      center: new window.naver.maps.LatLng(origin_lat, origin_lng),
      zoom: 8,
    });

    const path = [
      new window.naver.maps.LatLng(origin_lat, origin_lng),
      new window.naver.maps.LatLng(destination_lat, destination_lng),
    ];

    new window.naver.maps.Polyline({
      path,
      map,
      strokeColor: "#0070f3",
      strokeWeight: 4,
    });

    new window.naver.maps.Marker({
      position: path[0],
      map,
      title: route.origin,
    });

    new window.naver.maps.Marker({
      position: path[1],
      map,
      title: route.destination,
    });
  }, [route]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-xl shadow" />;
}
