import { useEffect, useRef } from 'react';
import { NAVER_MAP_SDK_ENDPOINT } from '../../shared/constants';

declare global {
  interface Window {
    naver?: any;
    __NAVER_MAP_SDK_PROMISE__?: Promise<void>;
  }
}

export interface MapPoint {
  lat: number;
  lng: number;
  name?: string;
}

interface MapViewProps {
  origin?: MapPoint | null;
  destination?: MapPoint | null;
  path?: Array<{ lat: number; lng: number }>;
}

async function ensureMapSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  if (!window.__NAVER_MAP_SDK_PROMISE__) {
    window.__NAVER_MAP_SDK_PROMISE__ = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = NAVER_MAP_SDK_ENDPOINT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Naver Map SDK'));
      document.head.appendChild(script);
    });
  }
  return window.__NAVER_MAP_SDK_PROMISE__;
}

export default function MapView({ origin, destination, path }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>();
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>();

  useEffect(() => {
    let cancelled = false;
    if (!mapRef.current) {
      return;
    }

    ensureMapSdk()
      .then(() => {
        if (cancelled || !window.naver) {
          return;
        }
        const naver = window.naver;
        const center = origin ?? destination ?? { lat: 37.5665, lng: 126.978 }; // Seoul fallback
        if (!mapInstance.current) {
          mapInstance.current = new naver.maps.Map(mapRef.current, {
            center: new naver.maps.LatLng(center.lat, center.lng),
            zoom: 8,
          });
        } else {
          mapInstance.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
        }

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        if (origin) {
          markersRef.current.push(
            new naver.maps.Marker({
              position: new naver.maps.LatLng(origin.lat, origin.lng),
              map: mapInstance.current,
              title: origin.name ?? '출발지',
              icon: {
                content:
                  '<div style="background:#0ea5e9;color:white;padding:6px 10px;border-radius:12px;font-weight:600">출발</div>',
              },
            }),
          );
        }

        if (destination) {
          markersRef.current.push(
            new naver.maps.Marker({
              position: new naver.maps.LatLng(destination.lat, destination.lng),
              map: mapInstance.current,
              title: destination.name ?? '도착지',
              icon: {
                content:
                  '<div style="background:#22c55e;color:white;padding:6px 10px;border-radius:12px;font-weight:600">도착</div>',
              },
            }),
          );
        }

        if (path && path.length > 1) {
          const linePath = path.map((coord) => new naver.maps.LatLng(coord.lat, coord.lng));
          if (polylineRef.current) {
            polylineRef.current.setMap(null);
          }
          polylineRef.current = new naver.maps.Polyline({
            map: mapInstance.current,
            path: linePath,
            strokeColor: '#0ea5e9',
            strokeOpacity: 0.8,
            strokeWeight: 5,
          });
          const bounds = new naver.maps.LatLngBounds(linePath[0], linePath[0]);
          linePath.forEach((latLng: any) => bounds.extend(latLng));
          mapInstance.current.fitBounds(bounds);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [origin, destination, path]);

  return <div className="map-container" ref={mapRef} />;
}
