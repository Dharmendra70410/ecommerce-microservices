import { useEffect, useState } from "react";
import { getLogs } from "../services/api";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getLogs().then(setLogs);
  }, []);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Logs Visualizer</h2>
        <span>Recent system events from gateway and workers</span>
      </div>

      <ul className="log-list">
        {logs.length === 0 && <li className="log-item">No logs yet</li>}
        {logs.map((log, index) => (
          <li key={index} className="log-item">
            <span className="log-time">{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</span>
            <span className="log-level">{log.level || "INFO"}</span>
            <span className="log-msg">{log.message || JSON.stringify(log)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
