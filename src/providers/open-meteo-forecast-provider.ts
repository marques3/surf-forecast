import { spots } from "../config/spots.js";
import type { CompassDirection, HourlyForecast, SpotForecast } from "../domain/types.js";
import type { ForecastProvider } from "./forecast-provider.js";

const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const SURF_HOURS = new Set([8, 11, 14, 17]);
const MAX_FORECAST_DAYS = 8;

type OpenMeteoResponse = {
  hourly?: {
    time?: string[];
    swell_wave_height?: Array<number | null>;
    swell_wave_direction?: Array<number | null>;
    swell_wave_period?: Array<number | null>;
    wind_speed_10m?: Array<number | null>;
    wind_direction_10m?: Array<number | null>;
  };
};

type Fetch = typeof fetch;

const compassDirection = (degrees: number): CompassDirection => {
  const directions: CompassDirection[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const normalised = ((degrees % 360) + 360) % 360;
  return directions[Math.round(normalised / 45) % directions.length];
};

const responseList = (payload: unknown): OpenMeteoResponse[] => Array.isArray(payload) ? payload as OpenMeteoResponse[] : [payload as OpenMeteoResponse];

const requiredSeries = (response: OpenMeteoResponse, name: string): Array<number | null> | string[] => {
  const series = response.hourly?.[name as keyof NonNullable<OpenMeteoResponse["hourly"]>];
  if (!Array.isArray(series)) throw new Error(`A Open-Meteo não devolveu a série horária '${name}'.`);
  return series;
};

/** Uses public APIs and asks for the closest sea grid cell for each spot. */
export class OpenMeteoForecastProvider implements ForecastProvider {
  constructor(private readonly fetchImpl: Fetch = fetch) {}

  async getForecast(days = 5): Promise<SpotForecast[]> {
    if (!Number.isInteger(days) || days < 1 || days > MAX_FORECAST_DAYS) {
      throw new RangeError(`'days' tem de ser um inteiro entre 1 e ${MAX_FORECAST_DAYS}.`);
    }
    const coordinates = { latitude: spots.map((spot) => spot.latitude).join(","), longitude: spots.map((spot) => spot.longitude).join(",") };
    const shared = new URLSearchParams({ ...coordinates, forecast_days: String(days), timezone: "GMT", cell_selection: "sea" });
    const marineQuery = new URLSearchParams(shared);
    marineQuery.set("hourly", "swell_wave_height,swell_wave_direction,swell_wave_period");
    const weatherQuery = new URLSearchParams(shared);
    weatherQuery.set("hourly", "wind_speed_10m,wind_direction_10m");
    weatherQuery.set("wind_speed_unit", "kmh");
    const [marinePayload, weatherPayload] = await Promise.all([
      this.request(`${MARINE_URL}?${marineQuery}`),
      this.request(`${WEATHER_URL}?${weatherQuery}`)
    ]);
    const marineBySpot = responseList(marinePayload);
    const weatherBySpot = responseList(weatherPayload);
    if (marineBySpot.length !== spots.length || weatherBySpot.length !== spots.length) {
      throw new Error("A Open-Meteo devolveu um número inesperado de localizações.");
    }
    return spots.map((spot, index) => ({ spot, hours: this.toHours(marineBySpot[index], weatherBySpot[index]) }));
  }

  async getTomorrowForecast(): Promise<SpotForecast[]> {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowDate = tomorrow.toISOString().slice(0, 10);
    const forecasts = await this.getForecast(2);
    return forecasts.map(({ spot, hours }) => ({ spot, hours: hours.filter((hour) => hour.timestamp.slice(0, 10) === tomorrowDate) }));
  }

  private async request(url: string): Promise<unknown> {
    const response = await this.fetchImpl(url);
    if (!response.ok) throw new Error(`A Open-Meteo respondeu com ${response.status} ${response.statusText}.`);
    return response.json();
  }

  private toHours(marine: OpenMeteoResponse, weather: OpenMeteoResponse): HourlyForecast[] {
    const time = requiredSeries(marine, "time") as string[];
    const height = requiredSeries(marine, "swell_wave_height") as Array<number | null>;
    const swellDirection = requiredSeries(marine, "swell_wave_direction") as Array<number | null>;
    const period = requiredSeries(marine, "swell_wave_period") as Array<number | null>;
    const windSpeed = requiredSeries(weather, "wind_speed_10m") as Array<number | null>;
    const windDirection = requiredSeries(weather, "wind_direction_10m") as Array<number | null>;
    return time.flatMap((timestamp, index) => {
      const hour = Number(timestamp.slice(11, 13));
      const values = [height[index], swellDirection[index], period[index], windSpeed[index], windDirection[index]];
      if (!SURF_HOURS.has(hour) || values.some((value) => value === null || value === undefined)) return [];
      return [{ timestamp: `${timestamp}:00.000Z`, waveHeightM: height[index]!, swellPeriodS: period[index]!, swellDirection: compassDirection(swellDirection[index]!), windSpeedKmh: windSpeed[index]!, windDirection: compassDirection(windDirection[index]!) }];
    });
  }
}
