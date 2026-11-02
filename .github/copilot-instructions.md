# Agent Guidelines

## Stack
- Plain JavaScript (ESM, `"type": "module"`), Node.js 20+. No build step, no TypeScript.
- SQLite access in the app via `better-sqlite3`. Web server via Node's built-in `http` module (no Express).
- Weather data from Open-Meteo (no API key):
  - Geocoding: https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1
  - Current weather: https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code

## Agent behavior
- ALWAYS call the `fetch` MCP tool on an API endpoint and inspect the real JSON before writing code that parses it.
- ALWAYS call `list_tables` / `describe_table` on the SQLite MCP server before writing or changing queries.
- Use parameterized queries only. Never build SQL with string concatenation.
- Handle errors: unknown city, network failure, empty DB. Print friendly messages, never stack traces.
- Keep files small and readable. Add a short comment above each function.
- After finishing a task, state exactly what you created and how to run it.
