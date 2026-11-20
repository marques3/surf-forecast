import type { HourlyForecast, Spot } from "./types.js";

export type BoardType = "fish" | "daily-shortboard" | "step-up";

export type BoardRecommendation = {
  type: BoardType;
  label: string;
  reason: string;
};

export function recommendBoard(spot: Spot, forecast: HourlyForecast): BoardRecommendation {
  const offshore = spot.preferredWindDirections.includes(forecast.windDirection) && forecast.windSpeedKmh <= spot.maxWindKmh;
  const energetic = forecast.waveHeightM >= 1.7 && forecast.swellPeriodS >= 13;

  if (forecast.waveHeightM >= 2.2 || energetic) {
    return {
      type: "step-up",
      label: "Step-up",
      reason: energetic ? "mais tamanho e energia" : "swell grande"
    };
  }

  if (forecast.waveHeightM <= 1 || (forecast.waveHeightM <= 1.4 && offshore)) {
    return {
      type: "fish",
      label: "Fish",
      reason: offshore && forecast.waveHeightM > 1 ? "onda pequena e vento offshore" : "onda pequena"
    };
  }

  return {
    type: "daily-shortboard",
    label: "Shortboard diária",
    reason: "condições intermédias"
  };
}
