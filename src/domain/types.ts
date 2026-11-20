import type { BoardRecommendation } from "./recommend-board.js";

export type CompassDirection =
  | "N"
  | "NE"
  | "E"
  | "SE"
  | "S"
  | "SW"
  | "W"
  | "NW";

export type Coast = "west" | "south";

export type Spot = {
  id: string;
  name: string;
  region: string;
  coast: Coast;
  latitude: number;
  longitude: number;
  preferredSwellDirections: CompassDirection[];
  preferredWindDirections: CompassDirection[];
  waveRangeM: { min: number; max: number };
  idealPeriodS: { min: number; max: number };
  maxWindKmh: number;
};

export type HourlyForecast = {
  timestamp: string;
  waveHeightM: number;
  swellPeriodS: number;
  swellDirection: CompassDirection;
  windSpeedKmh: number;
  windDirection: CompassDirection;
};

export type SpotForecast = {
  spot: Spot;
  hours: HourlyForecast[];
};

export type ScoredWindow = HourlyForecast & {
  score: number;
  reasons: string[];
};

export type Recommendation = {
  spot: Spot;
  bestWindow: ScoredWindow;
  board: BoardRecommendation;
};
