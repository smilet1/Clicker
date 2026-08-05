const DEFAULT_API_URL = 'http://localhost:8080';

export default class ScoreApi {
  constructor(baseUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getScore() {
    return this.request('/api/score');
  }

  async addClicks(amount, keepalive = false) {
    return this.request('/api/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
      keepalive,
    });
  }

  subscribe(onScore, onConnectionChange) {
    const eventSource = new EventSource(`${this.baseUrl}/api/events`);
    eventSource.addEventListener('open', () => onConnectionChange?.(true));
    eventSource.addEventListener('error', () => onConnectionChange?.(false));
    eventSource.addEventListener('score', (event) => {
      const payload = JSON.parse(event.data);
      if (Number.isSafeInteger(payload.score) && payload.score >= 0) {
        onScore(payload.score);
      }
    });
    return () => eventSource.close();
  }

  async request(path, options) {
    const response = await fetch(`${this.baseUrl}${path}`, options);
    if (!response.ok) {
      throw new Error(`Score API returned ${response.status}`);
    }
    return response.json();
  }
}
