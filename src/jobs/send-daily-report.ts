import "dotenv/config";
import { getTomorrowRecommendations } from "../services/recommendations.js";
import { sendNtfyNotification } from "../services/notifications.js";

const formatTime = (iso: string) => new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" }).format(new Date(iso));

const recommendations = await getTomorrowRecommendations();
const report = recommendations.map((item, index) => {
  const { spot, bestWindow, board } = item;
  return `${index + 1}. ${spot.name} (${spot.region}) — ${bestWindow.score}/100\n` +
    `   ${formatTime(bestWindow.timestamp)} · swell ${bestWindow.waveHeightM}m, ${bestWindow.swellPeriodS}s, ${bestWindow.swellDirection} · vento ${bestWindow.windDirection}, ${bestWindow.windSpeedKmh} km/h\n` +
    `   ${bestWindow.reasons.join("; ")}\n` +
    `   Prancha: ${board.label} (${board.reason})`;
}).join("\n\n");

const message = `Melhores spots para amanhã\n\n${report}`;
console.log(message);

const topic = process.env.NTFY_TOPIC;
if (!topic) {
  console.warn("NTFY_TOPIC não configurado; o relatório foi apenas apresentado no terminal.");
} else {
  await sendNtfyNotification(topic, message);
  console.log("Notificação ntfy enviada.");
}
