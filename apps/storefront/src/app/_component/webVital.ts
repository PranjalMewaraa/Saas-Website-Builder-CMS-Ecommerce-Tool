export function reportVitals(metric: any) {
  fetch("/api/vitals", {
    method: "POST",
    body: JSON.stringify(metric),
    headers: { "Content-Type": "application/json" },
  });
}
