import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import RouteList from '../components/RouteList';
import Timeline from '../components/Timeline';
import { API_ROUTES } from '../../shared/constants';
import type { EtaResponse } from '../../shared/types';

interface DirectionPath {
  path: Array<[number, number]>;
}

interface DirectionResponse {
  route: {
    trafast?: Array<{
      summary: { distance: number; duration: number };
      path: Array<[number, number]>;
    }>;
  };
}

function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

export default function Result() {
  const query = useQuery();
  const origin = query.get('origin');
  const destination = query.get('destination');
  const navigate = useNavigate();
  const [summary, setSummary] = useState<EtaResponse | null>(null);
  const [path, setPath] = useState<DirectionPath | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!origin || !destination) {
      navigate('/', { replace: true });
      return;
    }
    setLoading(true);
    const controller = new AbortController();

    fetch(`${API_ROUTES.ETA}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? '경로 정보를 찾을 수 없습니다.');
        }
        setSummary(payload);
        return payload as EtaResponse;
      })
      .then(async (payload) => {
        if (!payload.route.origin_lat || !payload.route.origin_lng || !payload.route.destination_lat || !payload.route.destination_lng) {
          return;
        }
        try {
          const start = `${payload.route.origin_lng},${payload.route.origin_lat}`;
          const goal = `${payload.route.destination_lng},${payload.route.destination_lat}`;
          const response = await fetch(`${API_ROUTES.DIRECTION}?start=${encodeURIComponent(start)}&goal=${encodeURIComponent(goal)}`);
          if (!response.ok) {
            return;
          }
          const data: DirectionResponse = await response.json();
          const trafast = data.route.trafast?.[0];
          if (trafast) {
            setPath({ path: trafast.path.map(([lng, lat]) => [lat, lng]) as Array<[number, number]> });
          }
        } catch (directionError) {
          console.error('Failed to load direction data', directionError);
        }
      })
      .catch((caughtError) => {
        console.error(caughtError);
        setError(caughtError instanceof Error ? caughtError.message : '알 수 없는 오류가 발생했습니다.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [origin, destination, navigate]);

  const timelineEvents = useMemo(() => {
    if (!summary) {
      return [];
    }
    return summary.nextDepartures.map(({ departureDate, arrivalDate }) => ({
      timestamp: departureDate,
      label: `출발 • ${summary.route.origin_name}`,
      description: `도착 예정 ${new Date(arrivalDate).toLocaleString()} (${summary.route.destination_name})`,
    }));
  }, [summary]);

  return (
    <div>
      {loading && <p>경로를 계산하고 있습니다…</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      <RouteList data={summary} />
      <section className="card">
        <h2>경로 타임라인</h2>
        <Timeline events={timelineEvents} />
      </section>
      <section className="card">
        <h2>지도 보기</h2>
        <MapView
          origin={
            summary?.route.origin_lat && summary?.route.origin_lng
              ? {
                  lat: summary.route.origin_lat,
                  lng: summary.route.origin_lng,
                  name: summary.route.origin_name,
                }
              : null
          }
          destination={
            summary?.route.destination_lat && summary?.route.destination_lng
              ? {
                  lat: summary.route.destination_lat,
                  lng: summary.route.destination_lng,
                  name: summary.route.destination_name,
                }
              : null
          }
          path={
            path?.path.map(([lat, lng]) => ({ lat, lng })) ??
            (summary
              ? [
                  { lat: summary.route.origin_lat ?? 37.5665, lng: summary.route.origin_lng ?? 126.978 },
                  { lat: summary.route.destination_lat ?? 37.498, lng: summary.route.destination_lng ?? 127.027 },
                ]
              : undefined)
          }
        />
      </section>
    </div>
  );
}
