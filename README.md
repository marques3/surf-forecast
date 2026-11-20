# Surf Forecast Portugal

MVP que classifica spots entre a Costa da Caparica e o Algarve, incluindo costa sudoeste e sul. Não utiliza base de dados: os spots vivem em código e as previsões vêm das APIs públicas Open-Meteo Marine e Weather, sem chave.

## Arrancar

Requer Node.js 20 ou superior.

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Endpoints disponíveis:

O dashboard está disponível em `GET /` (por omissão em `http://localhost:5000/`).

- `GET /health`
- `GET /api/spots`
- `GET /api/recommendations/tomorrow`
- `GET /api/recommendations?days=5` (entre 1 e 8 dias)

O fornecedor pede à Marine API a altura, direção e período de swell e à Weather API o vento a 10 m. Ambas as consultas usam `cell_selection=sea`, para escolher a célula marítima mais próxima de cada spot, em vez de uma célula em terra.

Para gerar o relatório diário no terminal:

```bash
npm run daily-report
```

## Notificação diária

O job envia o relatório para o tópico configurado em `NTFY_TOPIC`. No Windows, a tarefa `Surf Forecast Daily Report` corre diariamente às 07:00 (hora de Lisboa), desde que o computador esteja ligado, com acesso à internet e com a sessão iniciada. Não é necessário ter o VS Code, o servidor ou o dashboard abertos.

No telemóvel, instala a aplicação ntfy (ou usa `ntfy.sh/app`), subscreve o nome definido em `NTFY_TOPIC` e ativa as notificações. Trata esse nome como segredo: não o partilhes.

## Próximos passos

1. Validar e ajustar as regras de cada spot em `src/config/spots.ts`.
2. Criar um dashboard para comparar tendências e condições entre dias.
