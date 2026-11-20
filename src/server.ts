import "dotenv/config";
import express from "express";
import { spots } from "./config/spots.js";
import { getRecommendationsForDays, getTomorrowRecommendations } from "./services/recommendations.js";

const app = express();
app.use(express.static("public"));
const port = Number(process.env.PORT ?? 5000);

app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.get("/api/spots", (_request, response) => response.json(spots));
app.get("/api/recommendations/tomorrow", async (_request, response) => {
  try {
    response.json({ generatedAt: new Date().toISOString(), recommendations: await getTomorrowRecommendations() });
  } catch (error) {
    response.status(502).json({ error: error instanceof Error ? error.message : "Não foi possível obter a previsão." });
  }
});
app.get("/api/recommendations", async (request, response) => {
  const days = request.query.days === undefined ? 5 : Number(request.query.days);
  if (!Number.isInteger(days) || days < 1 || days > 8) {
    response.status(400).json({ error: "O parâmetro 'days' tem de ser um inteiro entre 1 e 8." });
    return;
  }
  try {
    response.json({ generatedAt: new Date().toISOString(), days: await getRecommendationsForDays(days) });
  } catch (error) {
    response.status(502).json({ error: error instanceof Error ? error.message : "Não foi possível obter a previsão." });
  }
});

app.listen(port, () => console.log(`Surf Forecast API em http://localhost:${port}`));
