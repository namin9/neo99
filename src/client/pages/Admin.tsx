import { useEffect, useState } from 'react';
import { API_ROUTES } from '../../shared/constants';
import type { Route, Terminal } from '../../shared/types';

interface AdminData {
  terminals: Terminal[];
  routes: Route[];
}

export default function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<Terminal[]>([]);

  useEffect(() => {
    fetch(API_ROUTES.BUS)
      .then((response) => response.json())
      .then((payload: AdminData) => setData(payload))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (!query) {
      setMatches([]);
      return;
    }
    const controller = new AbortController();
    fetch(`${API_ROUTES.BUS}?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => setMatches(payload.matches ?? []))
      .catch((error) => console.error(error));
    return () => controller.abort();
  }, [query]);

  return (
    <div>
      <section className="card">
        <h2>터미널 검색</h2>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="터미널 이름 검색" />
        {matches.length > 0 && (
          <ul className="search-suggestions" style={{ marginTop: '1rem' }}>
            {matches.map((terminal) => (
              <li key={terminal.id}>
                <strong>{terminal.name}</strong>
                <div style={{ fontSize: '0.8rem' }}>{terminal.city ?? '도시 정보 없음'}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>데이터 요약</h2>
        {data ? (
          <div className="route-list">
            <div className="route-card">
              <h3>터미널</h3>
              <p>{data.terminals.length.toLocaleString()}개</p>
            </div>
            <div className="route-card">
              <h3>노선</h3>
              <p>{data.routes.length.toLocaleString()}개</p>
            </div>
          </div>
        ) : (
          <p>데이터를 불러오는 중입니다…</p>
        )}
      </section>
    </div>
  );
}
