import { rankSpots } from "../domain/rank-spots.js";
import type { Recommendation } from "../domain/types.js";
import type { ForecastProvider } from "../providers/forecast-provider.js";
import { OpenMeteoForecastProvider } from "../providers/open-meteo-forecast-provider.js";

const defaultProvider = () => new OpenMeteoForecastProvider();

export type DailyRecommendations = {
  date: string;
  recommendations: Recommendation[];
};

export async function getTomorrowRecommendations(provider: ForecastProvider = defaultProvider()): Promise<Recommendation[]> {
  return rankSpots(await provider.getTomorrowForecast());
}

export async function getRecommendationsForDays(days = 5, provider: ForecastProvider = defaultProvider()): Promise<DailyRecommendations[]> {
  const forecasts = await provider.getForecast(days);
  const dates = [...new Set(forecasts.flatMap(({ hours }) => hours.map((hour) => hour.timestamp.slice(0, 10))))];
  return dates.map((date) => ({
    date,
    recommendations: rankSpots(forecasts.map(({ spot, hours }) => ({
      spot,
      hours: hours.filter((hour) => hour.timestamp.slice(0, 10) === date)
    })))
  }));
}
