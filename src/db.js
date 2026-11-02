import Database from "better-sqlite3";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const databasePath = resolve(dirname(fileURLToPath(import.meta.url)), "../weather.db");
const database = new Database(databasePath);

const insertStatement = database.prepare(`
  INSERT INTO weather_logs (
    city, country, latitude, longitude, temperature_c, humidity,
    wind_kmh, condition, weather_code
  ) VALUES (
    @city, @country, @latitude, @longitude, @temperature_c, @humidity,
    @wind_kmh, @condition, @weather_code
  )
`);

const listStatement = database.prepare(`
  SELECT id, city, country, latitude, longitude, temperature_c, humidity,
         wind_kmh, condition, weather_code, created_at
  FROM weather_logs
  ORDER BY datetime(created_at) DESC, id DESC
  LIMIT ?
`);

const statsStatement = database.prepare(`
  SELECT MIN(temperature_c) AS min_temperature_c,
         MAX(temperature_c) AS max_temperature_c,
         AVG(temperature_c) AS average_temperature_c,
         COUNT(*) AS log_count
  FROM weather_logs
  WHERE city = ? COLLATE NOCASE
`);

// Store one weather observation using bound SQL parameters.
export function insertWeatherLog(weather) {
  return insertStatement.run(weather).lastInsertRowid;
}

// Return the most recent observations up to the requested limit.
export function getRecentLogs(limit = 10) {
  return listStatement.all(limit);
}

// Summarize logged temperatures for a city, ignoring NULL temperatures in aggregates.
export function getCityStats(city) {
  return statsStatement.get(city);
}

// Close the database connection after the CLI command finishes.
export function closeDatabase() {
  database.close();
}