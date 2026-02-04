import React from "react";

function formatCountdown(target?: string, showSeconds?: boolean) {
  if (!target) return "Set a date";
  const targetDate = new Date(target);
  if (Number.isNaN(targetDate.getTime())) return "Invalid date";
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return showSeconds
    ? `${days}d ${hours}h ${mins}m ${secs}s`
    : `${days}d ${hours}h ${mins}m`;
}

export default function AtomicCountdown(props: {
  targetDate?: string;
  label?: string;
  showSeconds?: boolean;
}) {
  return (
    <div>
      {props.label ? (
        <div style={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
          {props.label}
        </div>
      ) : null}
      <div style={{ fontSize: 20, fontWeight: 600 }}>
        {formatCountdown(props.targetDate, props.showSeconds)}
      </div>
    </div>
  );
}
