"use client";
import { useEffect, useState } from "react";

export default function SeoDashboard({ snapshotId }: any) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch(`/api/admin/seo/audit?snapshot_id=${snapshotId}`)
      .then((r) => r.json())
      .then((d) => setRows(d.report));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">SEO Audit</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Path</th>
            <th>Score</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.path}>
              <td>{r.path}</td>
              <td>{r.score}</td>
              <td>{r.issues.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
