# @networkcamp/sdk

Official TypeScript SDK for the network.camp public API.

## Installation

```sh
npm install @networkcamp/sdk
```

## Usage

```ts
import { NetworkCamp } from '@networkcamp/sdk';

const api = new NetworkCamp('nc_<keyId>_<secret>');

// List all monitors
const { data: monitors } = await api.listMonitors();
console.log(monitors);

// Get response time series for a monitor
const { data: series } = await api.responseSeries('mon_abc123');
console.log(series);

// List incidents
const { data: incidents } = await api.listIncidents();
console.log(incidents);

// Get daily latency aggregates for a monitor
const { data: latency } = await api.latencyDaily('mon_abc123');
console.log(latency);
```

## API Endpoints

All endpoints require authentication with your API key in the `Authorization` header:

```
Authorization: Bearer nc_<keyId>_<secret>
```

### listMonitors()
**GET** `/v1/monitors`

Returns all monitors for your domains.

### responseSeries(monitorId: string, limit = 720)
**GET** `/v1/monitors/{monitorId}/response-series?limit={limit}`

Returns a time series of recent checks for a monitor.

### listIncidents()
**GET** `/v1/incidents`

Returns all incidents for your domains.

### latencyDaily(monitorId: string)
**GET** `/v1/monitors/{monitorId}/latency-daily`

Returns daily latency aggregates for a monitor.

## Error Handling & Redundancy

All methods throw on network or API errors, with descriptive messages. Requests are retried up to 3 times with exponential backoff for transient errors.

## Types

All responses are fully typed. See `src/index.ts` for type definitions: `Monitor`, `ResponsePoint`, `Incident`, `LatencyDaily`.

## Links & Community

- GitHub: https://github.com/networkcamp
- Twitter/X: https://x.com/networkdotcamp
- Instagram: https://www.instagram.com/networkdotcamp/

## License
MIT
