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
    let active = true;
    let timer = null;

    const poll = async () => {
      try {
        const { score } = await this.getScore();
        if (active && Number.isSafeInteger(score) && score >= 0) {
          onScore(score);
          onConnectionChange?.(true);
        }
      } catch {
        if (active) onConnectionChange?.(false);
      } finally {
        if (active) timer = window.setTimeout(poll, 1000);
      }
    };

    timer = window.setTimeout(poll, 1000);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }

  async request(path, options) {
    const response = await fetch(`${this.baseUrl}${path}`, options);
    if (!response.ok) {
      throw new Error(`Score API returned ${response.status}`);
    }
    return response.json();
  }
}
