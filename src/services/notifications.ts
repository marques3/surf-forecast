const DEFAULT_NTFY_SERVER = "https://ntfy.sh";

export async function sendNtfyNotification(topic: string, message: string): Promise<void> {
  const server = (process.env.NTFY_SERVER_URL ?? DEFAULT_NTFY_SERVER).replace(/\/$/, "");
  const response = await fetch(`${server}/${encodeURIComponent(topic)}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Title": "Surf Forecast Portugal",
      "Tags": "surfer,wave"
    },
    body: message
  });
  if (!response.ok) {
    throw new Error(`O ntfy respondeu com ${response.status} ${response.statusText}.`);
  }
}
