import { recommendBoard } from "./recommend-board.js";
import { scoreSpot } from "./score-spot.js";
import type { Recommendation, SpotForecast } from "./types.js";

export function rankSpots(forecasts: SpotForecast[], limit = 3): Recommendation[] {
  return forecasts
    .map(({ spot, hours }) => {
      const scored = hours.map((hour) => scoreSpot(spot, hour));
      const bestWindow = scored.reduce((best, window) => (window.score > best.score ? window : best));
      return { spot, bestWindow, board: recommendBoard(spot, bestWindow) };
    })
    .sort((a, b) => b.bestWindow.score - a.bestWindow.score)
    .slice(0, limit);
}
