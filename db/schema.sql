CREATE TABLE weather_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  country TEXT,
  latitude REAL,
  longitude REAL,
  temperature_c REAL,
  humidity INTEGER,
  wind_kmh REAL,
  condition TEXT,
  weather_code INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weather_logs_city_created_at ON weather_logs (city, created_at);
