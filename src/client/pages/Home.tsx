import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import { API_ROUTES } from '../../shared/constants';
import type { EtaResponse } from '../../shared/types';
import RouteList from '../components/RouteList';

export default function Home() {
  const [origin, setOrigin] = useState('청주고속버스터미널');
  const [destination, setDestination] = useState('센트럴시티(서울)');
  const [isLoading, setLoading] = useState(false);
  const [preview, setPreview] = useState<EtaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_ROUTES.ETA}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(
          destination,
        )}`,
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? '경로를 계산하지 못했습니다.');
      }
      setPreview(payload);
      navigate(`/result?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
    } catch (caughtError) {
      console.error(caughtError);
      setError(caughtError instanceof Error ? caughtError.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="card">
        <h2>역 ETA 검색</h2>
        <p>출발지와 도착지를 선택하면 가장 빠른 역방향 경로와 도착 시간을 예측합니다.</p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
          <SearchBox label="출발" value={origin} onChange={setOrigin} placeholder="예: 청주고속" />
          <SearchBox label="도착" value={destination} onChange={setDestination} placeholder="예: 센트럴" />
          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? '계산 중…' : '경로 탐색'}
          </button>
        </form>
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      </section>
      <RouteList data={preview} />
    </div>
  );
}
