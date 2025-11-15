
export type Monitor = {
  id: string;
  domainId: string;
  name: string;
  type: string;
  status: 'up' | 'down' | 'degraded';
  lastCheckedAt?: string;
  createdAt: string;
  uptime?: number;
  interval?: number;
};

export type ResponsePoint = {
  timestamp: string;
  responseTimeMs: number;
  status: 'up' | 'down' | 'degraded';
};

export type Incident = {
  id: string;
  domainId: string;
  title: string;
  description: string;
  status: 'investigating' | 'monitoring' | 'resolved';
  kind: string;
  impacts: { monitorId: string; impact: string }[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type LatencyDaily = {
  date: string;
  p50: number;
  p95: number;
  p99: number;
  count: number;
};

export class NetworkCamp {
  constructor(private apiKey: string, private base = 'https://network.camp/api') {}

  /**
   * Internal request with retry and improved error handling.
   */
  private async req<T>(path: string, retries = 2): Promise<T> {
    let lastErr: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const r = await fetch(this.base + path, {
          headers: { Authorization: 'Bearer ' + this.apiKey }
        });
        if (!r.ok) {
          let msg = `NetworkCamp API error: ${r.status} ${r.statusText}`;
          let body: any = null;
          try { body = await r.json(); } catch {}
          if (body && body.error) msg += ` - ${body.error}`;
          if (r.status === 401) msg += ' (Unauthorized: check your API key)';
          if (r.status === 429) msg += ' (Rate limit exceeded: slow down requests)';
          throw new Error(msg);
        }
        return r.json() as Promise<T>;
      } catch (err) {
        lastErr = err;
        if (attempt < retries) {
          // Exponential backoff
          await new Promise(res => setTimeout(res, 250 * Math.pow(2, attempt)));
        }
      }
    }
    throw new Error(`NetworkCamp SDK request failed after ${retries + 1} attempts: ${lastErr?.message || lastErr}`);
  }

  /**
   * List monitors for all domains you own.
   * GET /v1/monitors
   */
  listMonitors() {
    return this.req<{ data: Monitor[] }>('/v1/monitors');
  }

  /**
   * Get time series of recent checks for a monitor.
   * GET /v1/monitors/[monitorId]/response-series
   */
  responseSeries(monitorId: string, limit = 720) {
    return this.req<{ data: ResponsePoint[] }>(`/v1/monitors/${monitorId}/response-series?limit=${limit}`);
  }

  /**
   * List incidents for your domains.
   * GET /v1/incidents
   */
  listIncidents() {
    return this.req<{ data: Incident[] }>('/v1/incidents');
  }

  /**
   * Get daily latency aggregates for a monitor.
   * GET /v1/monitors/[monitorId]/latency-daily
   */
  latencyDaily(monitorId: string) {
    return this.req<{ data: LatencyDaily[] }>(`/v1/monitors/${monitorId}/latency-daily`);
  }
}
