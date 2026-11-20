import { spots } from "../config/spots.js";
import type { CompassDirection, HourlyForecast, SpotForecast } from "../domain/types.js";
import type { ForecastProvider } from "./forecast-provider.js";

const directions: CompassDirection[] = ["NW", "W", "SW", "E", "NE", "N"];

// Dados determinísticos para o projeto funcionar antes de escolhermos uma API de previsão.
export class DemoForecastProvider implements ForecastProvider {
  async getForecast(): Promise<SpotForecast[]> {
    return this.getTomorrowForecast();
  }

  async getTomorrowForecast(): Promise<SpotForecast[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return spots.map((spot, index) => {
      const hours: HourlyForecast[] = [8, 11, 14, 17].map((hour, hourIndex) => {
        const at = new Date(tomorrow);
        at.setHours(hour);
        return {
          timestamp: at.toISOString(),
          waveHeightM: Number((0.8 + ((index * 3 + hourIndex) % 9) / 10).toFixed(1)),
          swellPeriodS: 9 + ((index + hourIndex * 2) % 6),
          swellDirection: directions[(index + hourIndex) % 3],
          windSpeedKmh: 7 + ((index * 2 + hourIndex * 3) % 18),
          windDirection: directions[(index + hourIndex + 3) % directions.length]
        };
      });
      return { spot, hours };
    });
  }
}
