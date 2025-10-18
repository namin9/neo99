interface TimelineEvent {
  label: string;
  timestamp: string;
  description?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return <p>타임라인 정보가 없습니다.</p>;
  }

  return (
    <div className="timeline">
      {events.map((event) => (
        <div className="timeline-event" key={`${event.label}-${event.timestamp}`}>
          <time>{new Date(event.timestamp).toLocaleString()}</time>
          <div>{event.label}</div>
          {event.description && (
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>{event.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
