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

const citySummariesStatement = database.prepare(`
  WITH ranked_logs AS (
    SELECT city, country, temperature_c, created_at,
           AVG(temperature_c) OVER (PARTITION BY city COLLATE NOCASE) AS average_temperature_c,
           COUNT(*) OVER (PARTITION BY city COLLATE NOCASE) AS log_count,
           ROW_NUMBER() OVER (
             PARTITION BY city COLLATE NOCASE
             ORDER BY datetime(created_at) DESC, id DESC
           ) AS row_number
    FROM weather_logs
  )
  SELECT city, country, temperature_c AS latest_temperature_c,
         average_temperature_c, log_count, created_at AS latest_created_at
  FROM ranked_logs
  WHERE row_number = 1
  ORDER BY datetime(latest_created_at) DESC, city COLLATE NOCASE
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

// Return the latest observation and temperature aggregates for each city.
export function getCitySummaries() {
  return citySummariesStatement.all();
}

// Close the database connection after the CLI command finishes.
export function closeDatabase() {
  database.close();
}