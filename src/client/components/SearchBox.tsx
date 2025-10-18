import { useEffect, useRef, useState } from 'react';
import { API_ROUTES } from '../../shared/constants';

interface SearchBoxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface JusoItem {
  roadAddr: string;
  jibunAddr: string;
}

export default function SearchBox({ label, value, onChange, placeholder }: SearchBoxProps) {
  const [suggestions, setSuggestions] = useState<JusoItem[]>([]);
  const [isFocused, setFocused] = useState(false);
  const debounceRef = useRef<number>();

  useEffect(() => {
    if (!value) {
      setSuggestions([]);
      return;
    }

    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_ROUTES.GEO}?keyword=${encodeURIComponent(value)}&countPerPage=10`,
        );

        const text = await response.text();

        // 🧩 HTML 응답이면 즉시 중단
        if (text.trim().startsWith('<')) {
          console.warn('JUSO API returned HTML, not JSON:', text.slice(0, 100));
          setSuggestions([]);
          return;
        }

        const payload = JSON.parse(text);
        const results = payload?.results?.juso ?? [];

        setSuggestions(results);
      } catch (error) {
        console.error('JUSO API fetch error:', error);
        setSuggestions([]);
      }
    }, 250);

    return () => window.clearTimeout(debounceRef.current);
  }, [value]);

  return (
    <div>
      <label>
        <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>{label}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
        />
      </label>
      {isFocused && suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((item) => (
            <li
              key={`${item.roadAddr}-${item.jibunAddr}`}
              onMouseDown={() => onChange(item.roadAddr || item.jibunAddr)}
            >
              <strong>{item.roadAddr || item.jibunAddr}</strong>
              {item.jibunAddr && (
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.jibunAddr}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
