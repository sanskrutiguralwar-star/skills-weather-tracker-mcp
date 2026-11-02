import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  closeDatabase,
  getCityStats,
  getRecentLogs,
  insertWeatherLog,
} from "./db.js";
import { getWeatherForCity } from "./weather.js";

const usage = `Usage:
  node src/cli.js add "<city>"
  node src/cli.js list [--limit N]
  node src/cli.js stats "<city>"`;

// Render missing numeric values consistently in CLI output.
function displayNumber(value, digits = 1) {
  return value === null || value === undefined ? "-" : Number(value).toFixed(digits);
}

// Parse the supported optional list limit and reject malformed values.
function parseListLimit(args) {
  if (args.length === 0) return 10;
  if (args.length !== 2 || args[0] !== "--limit") {
    throw new Error(`Invalid list options.\n${usage}`);
  }

  const limit = Number(args[1]);
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new Error("The --limit value must be a positive whole number.");
  }
  return limit;
}

// Execute one of the supported weather tracker commands.
async function runCommand(args) {
  const [command, ...commandArgs] = args;

  if (command === "add") {
    const city = commandArgs.join(" ").trim();
    if (!city) throw new Error(`Provide a city to add.\n${usage}`);

    const weather = await getWeatherForCity(city);
    const id = insertWeatherLog(weather);
    console.log(
      `Logged ${weather.city}, ${weather.country ?? ""}: ${weather.temperature_c.toFixed(1)} C, ` +
        `${weather.condition}, wind ${weather.wind_kmh.toFixed(1)} km/h (log ${id}).`,
    );
    return;
  }

  if (command === "list") {
    const logs = getRecentLogs(parseListLimit(commandArgs));
    if (logs.length === 0) {
      console.log("No weather logs found.");
      return;
    }

    console.table(
      logs.map((log) => ({
        id: log.id,
        city: log.city,
        country: log.country ?? "-",
        temperature_c: displayNumber(log.temperature_c),
        humidity: log.humidity === null ? "-" : `${log.humidity}%`,
        wind_kmh: log.wind_kmh === null ? "-" : `${displayNumber(log.wind_kmh)} km/h`,
        condition: log.condition ?? "-",
        weather_code: log.weather_code ?? "-",
        created_at: log.created_at,
      })),
    );
    return;
  }

  if (command === "stats") {
    const city = commandArgs.join(" ").trim();
    if (!city) throw new Error(`Provide a city for statistics.\n${usage}`);

    const stats = getCityStats(city);
    if (stats.log_count === 0) {
      console.log(`No weather logs found for "${city}".`);
      return;
    }

    console.log(`Weather statistics for ${city} (${stats.log_count} logs)`);
    console.log(`Minimum: ${displayNumber(stats.min_temperature_c)} C`);
    console.log(`Maximum: ${displayNumber(stats.max_temperature_c)} C`);
    console.log(`Average: ${displayNumber(stats.average_temperature_c)} C`);
    return;
  }

  throw new Error(usage);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  runCommand(process.argv.slice(2))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : "The command failed.");
      process.exitCode = 1;
    })
    .finally(closeDatabase);
}