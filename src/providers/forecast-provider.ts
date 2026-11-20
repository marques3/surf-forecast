import type { SpotForecast } from "../domain/types.js";

export interface ForecastProvider {
  /** Forecasts start today and include the requested number of calendar days. */
  getForecast(days?: number): Promise<SpotForecast[]>;
  getTomorrowForecast(): Promise<SpotForecast[]>;
}
