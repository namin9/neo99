import type { EtaResponse } from '../../shared/types';
import { formatMinutes } from '../../shared/utils';

interface RouteListProps {
  data: EtaResponse | null;
}

export default function RouteList({ data }: RouteListProps) {
  if (!data) {
    return (
      <div className="card">
        <p>검색 결과가 없습니다. 출발지와 도착지를 다시 확인해주세요.</p>
      </div>
    );
  }

  const { route, distanceKm, totalDurationMinutes, nextDepartures } = data;

  return (
    <div className="card">
      <h2>
        {route.origin_name} → {route.destination_name}
      </h2>
      <p>
        {route.company} · {route.grade}
      </p>
      <p>
        이동거리 {distanceKm.toFixed(1)}km · 예상 소요시간 {formatMinutes(totalDurationMinutes)}
      </p>
      <div className="timeline" style={{ marginTop: '1.5rem' }}>
        {nextDepartures.map(({ schedule, departureDate, arrivalDate }) => (
          <div className="timeline-event" key={schedule.id}>
            <time>{new Date(departureDate).toLocaleString()}</time>
            <div>
              도착 {new Date(arrivalDate).toLocaleString()} · 배차 {schedule.departure_time}
            </div>
          </div>
        ))}
        {nextDepartures.length === 0 && <p>등록된 운행 일정이 없습니다.</p>}
      </div>
    </div>
  );
}
