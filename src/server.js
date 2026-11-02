import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  getCitySummaries,
  getRecentLogs,
  insertWeatherLog,
} from "./db.js";
import { getWeatherForCity, UnknownCityError, WeatherApiError } from "./weather.js";

const dashboardPath = fileURLToPath(new URL("../public/index.html", import.meta.url));
const port = Number(process.env.PORT ?? 3000);

// Send a JSON response with an explicit content type.
function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

// Serve the single-page dashboard.
async function serveDashboard(response) {
  try {
    const html = await readFile(dashboardPath);
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(html);
  } catch {
    sendJson(response, 500, { error: "The dashboard page could not be loaded." });
  }
}

// Route the dashboard page and its JSON API endpoints.
async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && (requestUrl.pathname === "/" || requestUrl.pathname === "/index.html")) {
    await serveDashboard(response);
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/logs") {
    sendJson(response, 200, getRecentLogs(50));
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/summary") {
    sendJson(response, 200, getCitySummaries());
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/refresh") {
    const city = requestUrl.searchParams.get("city")?.trim();
    if (!city) {
      sendJson(response, 400, { error: "Provide a city with the city query parameter." });
      return;
    }

    try {
      const weather = await getWeatherForCity(city);
      const id = insertWeatherLog(weather);
      sendJson(response, 201, { id, city: weather.city, country: weather.country });
    } catch (error) {
      if (error instanceof UnknownCityError) {
        sendJson(response, 404, { error: error.message });
      } else if (error instanceof WeatherApiError) {
        sendJson(response, 502, { error: error.message });
      } else {
        sendJson(response, 500, { error: "The weather observation could not be saved." });
      }
    }
    return;
  }

  sendJson(response, 404, { error: "Route not found." });
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch(() => {
    if (!response.headersSent) {
      sendJson(response, 500, { error: "The request could not be completed." });
    } else {
      response.destroy();
    }
  });
});

// Print the local dashboard URL after the listener is ready.
function onListening() {
  console.log(`Weather dashboard is running at http://localhost:${port}`);
}

// Report listener startup failures without exposing a stack trace.
function onServerError(error) {
  console.error(`Could not start the weather dashboard: ${error.message}`);
  process.exitCode = 1;
}

server.on("error", onServerError);
server.listen(port, "0.0.0.0", onListening);