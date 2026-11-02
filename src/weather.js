const geocodingEndpoint = "https://geocoding-api.open-meteo.com/v1/search";
const forecastEndpoint = "https://api.open-meteo.com/v1/forecast";

// Represent city lookup failures separately so the CLI can report them clearly.
export class UnknownCityError extends Error {}

// Represent API and response failures without exposing a stack trace to CLI users.
export class WeatherApiError extends Error {}

// Fetch and decode a JSON response, converting network and HTTP errors to friendly messages.
async function fetchJson(url, serviceName) {
  let response;

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  } catch {
    throw new WeatherApiError(`Could not reach Open-Meteo ${serviceName}. Check your network and try again.`);
  }

  if (!response.ok) {
    throw new WeatherApiError(`Open-Meteo ${serviceName} request failed (HTTP ${response.status}).`);
  }

  try {
    return await response.json();
  } catch {
    throw new WeatherApiError(`Open-Meteo ${serviceName} returned invalid JSON.`);
  }
}

// Convert a WMO weather code into a concise, readable condition.
export function conditionFromWeatherCode(code) {
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown";
}

// Resolve a city and return its current weather in the database's units and shape.
export async function getWeatherForCity(cityName) {
  const requestedCity = cityName.trim();
  if (!requestedCity) {
    throw new Error("Enter a city name.");
  }

  const geocodingUrl = new URL(geocodingEndpoint);
  geocodingUrl.searchParams.set("name", requestedCity);
  geocodingUrl.searchParams.set("count", "1");
  const geocoding = await fetchJson(geocodingUrl, "geocoding service");
  const location = geocoding.results?.[0];

  if (!location) {
    throw new UnknownCityError(`No matching city was found for "${requestedCity}".`);
  }

  const forecastUrl = new URL(forecastEndpoint);
  forecastUrl.searchParams.set("latitude", String(location.latitude));
  forecastUrl.searchParams.set("longitude", String(location.longitude));
  forecastUrl.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
  );
  forecastUrl.searchParams.set("temperature_unit", "celsius");
  forecastUrl.searchParams.set("wind_speed_unit", "kmh");

  const forecast = await fetchJson(forecastUrl, "current-weather service");
  const current = forecast.current;
  const values = [
    current?.temperature_2m,
    current?.relative_humidity_2m,
    current?.wind_speed_10m,
    current?.weather_code,
  ];

  if (!values.every(Number.isFinite) || !Number.isInteger(current.weather_code)) {
    throw new WeatherApiError("Open-Meteo returned incomplete current-weather data.");
  }

  return {
    city: location.name,
    country: location.country ?? null,
    latitude: location.latitude,
    longitude: location.longitude,
    temperature_c: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    wind_kmh: current.wind_speed_10m,
    condition: conditionFromWeatherCode(current.weather_code),
    weather_code: current.weather_code,
  };
}