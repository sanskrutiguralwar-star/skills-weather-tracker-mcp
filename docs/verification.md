# Weather Log Verification

Database checked: `weather_logs`, 5 rows total.

| City | Row count | Average temperature (C) |
|---|---:|---:|
| London | 2 | 8.75 |
| Pune | 2 | 29.5 |
| Tokyo | 1 | 14.9 |

## Findings

- CLI observations are present: London (`id` 2) and Tokyo (`id` 3).
- Two later observations are also present: London (`id` 4, `2026-11-02 07:49:19`) and Pune (`id` 5, `2026-11-02 07:49:26`). Their timing is consistent with dashboard use after the server was started. The table has no source column, so their origin cannot be proven from SQLite alone.
- Five weather values are `NULL`, all on the original Pune seed row (`id` 1): `temperature_c`, `humidity`, `wind_kmh`, `condition`, and `weather_code`. No city, country, coordinate, or timestamp values are `NULL`.
- No duplicate `(city, created_at)` groups were found.
