# Open-Meteo API Notes

## Geocoding

Endpoint: `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1`

The `results[0]` fields used for Pune are `name`, `country`, `latitude`, and `longitude`. The observed response resolved Pune to India at latitude `18.51957` and longitude `73.85535`. Use the coordinates in the current-weather request.

Trimmed live response:

```json
{
  "results": [
    {
      "name": "Pune",
      "latitude": 18.51957,
      "longitude": 73.85535,
      "country": "India"
    }
  ]
}
```

## Current Weather

Endpoint: `https://api.open-meteo.com/v1/forecast`

Query parameters used:

- `latitude=18.51957`
- `longitude=73.85535`
- `current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`

Expected current fields and database mapping:

- `current.temperature_2m` -> `temperature_c`
- `current.relative_humidity_2m` -> `humidity`
- `current.wind_speed_10m` -> `wind_kmh`; interpret using the response's `current_units.wind_speed_10m`
- `current.weather_code` -> `weather_code`; `condition` is a readable label derived from this code

The MCP fetch of the forecast URL was blocked by the host's `robots.txt`, so no live current-weather JSON or values were available for this run. The following is a shape template only, not a response from the API:

```json
{
  "current": {
    "temperature_2m": "<not retrieved>",
    "relative_humidity_2m": "<not retrieved>",
    "wind_speed_10m": "<not retrieved>",
    "weather_code": "<not retrieved>"
  },
  "current_units": {
    "temperature_2m": "<not retrieved>",
    "relative_humidity_2m": "<not retrieved>",
    "wind_speed_10m": "<not retrieved>"
  }
}
```
