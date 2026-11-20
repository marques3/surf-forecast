import type { HourlyForecast, ScoredWindow, Spot } from "./types.js";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function scoreSpot(spot: Spot, forecast: HourlyForecast): ScoredWindow {
  let score = 0;
  const reasons: string[] = [];

  if (spot.preferredSwellDirections.includes(forecast.swellDirection)) {
    score += 30;
    reasons.push(`swell favorável de ${forecast.swellDirection}`);
  } else {
    score += 8;
  }

  const { min: minPeriod, max: maxPeriod } = spot.idealPeriodS;
  if (forecast.swellPeriodS >= minPeriod && forecast.swellPeriodS <= maxPeriod) {
    score += 25;
    reasons.push(`período sólido (${forecast.swellPeriodS}s)`);
  } else {
    score += clamp(25 - Math.abs(forecast.swellPeriodS - minPeriod) * 4, 0, 15);
  }

  const { min: minWave, max: maxWave } = spot.waveRangeM;
  if (forecast.waveHeightM >= minWave && forecast.waveHeightM <= maxWave) {
    score += 25;
    reasons.push(`tamanho adequado (${forecast.waveHeightM}m)`);
  } else {
    score += clamp(20 - Math.min(Math.abs(forecast.waveHeightM - minWave), Math.abs(forecast.waveHeightM - maxWave)) * 15, 0, 15);
  }

  if (spot.preferredWindDirections.includes(forecast.windDirection) && forecast.windSpeedKmh <= spot.maxWindKmh) {
    score += 20;
    reasons.push(`vento favorável de ${forecast.windDirection} a ${forecast.windSpeedKmh} km/h`);
  } else if (forecast.windSpeedKmh <= spot.maxWindKmh) {
    score += 8;
    reasons.push(`vento tolerável a ${forecast.windSpeedKmh} km/h`);
  } else {
    reasons.push(`vento forte a ${forecast.windSpeedKmh} km/h`);
  }

  return { ...forecast, score: Math.round(score), reasons };
}
