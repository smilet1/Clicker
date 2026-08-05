import Phaser from 'phaser';
import ScoreApi from '../services/ScoreApi.js';

export const GAME_EVENTS = Object.freeze({
  SCORE_CHANGED: 'score-changed',
  CONNECTION_CHANGED: 'connection-changed',
});

export default class GameManager {
  #score = 0;
  #serverScore = 0;
  #pendingClicks = 0;
  #inFlightClicks = 0;
  #flushTimer = null;
  #retryTimer = null;
  #isSending = false;
  #destroyed = false;
  #events = new Phaser.Events.EventEmitter();
  #api;
  #unsubscribe;

  constructor(api = new ScoreApi()) {
    this.#api = api;
    this.#unsubscribe = api.subscribe(
      (score) => this.#acceptServerScore(score),
      (connected) => this.#events.emit(GAME_EVENTS.CONNECTION_CHANGED, connected),
    );
    this.#loadInitialScore();
    window.addEventListener('pagehide', this.#handlePageHide);
  }

  get score() {
    return this.#score;
  }

  addScore(amount = 1) {
    if (!Number.isSafeInteger(amount) || amount <= 0) return this.#score;

    this.#pendingClicks += amount;
    this.#score += amount;
    this.#events.emit(GAME_EVENTS.SCORE_CHANGED, this.#score, amount);
    this.#scheduleFlush();
    return this.#score;
  }

  async #loadInitialScore() {
    try {
      const { score } = await this.#api.getScore();
      this.#acceptServerScore(score);
    } catch {
      this.#events.emit(GAME_EVENTS.CONNECTION_CHANGED, false);
    }
  }

  #acceptServerScore(score) {
    if (!Number.isSafeInteger(score) || score < 0 || this.#destroyed) return;

    this.#serverScore = Math.max(this.#serverScore, score);
    const optimisticScore = Math.max(
      this.#score,
      this.#serverScore + this.#pendingClicks,
    );
    if (optimisticScore !== this.#score) {
      this.#score = optimisticScore;
      this.#events.emit(GAME_EVENTS.SCORE_CHANGED, this.#score, 0);
    }
  }

  #scheduleFlush(delay = 100) {
    if (this.#flushTimer || this.#isSending || this.#destroyed) return;
    this.#flushTimer = window.setTimeout(() => {
      this.#flushTimer = null;
      this.#flush();
    }, delay);
  }

  async #flush() {
    if (this.#isSending || this.#pendingClicks === 0 || this.#destroyed) return;

    const amount = Math.min(this.#pendingClicks, 1000);
    this.#pendingClicks -= amount;
    this.#inFlightClicks += amount;
    this.#isSending = true;

    try {
      const { score } = await this.#api.addClicks(amount);
      this.#inFlightClicks -= amount;
      this.#serverScore = Math.max(this.#serverScore, score);
      this.#score = this.#serverScore + this.#pendingClicks + this.#inFlightClicks;
      this.#events.emit(GAME_EVENTS.SCORE_CHANGED, this.#score, 0);
      this.#events.emit(GAME_EVENTS.CONNECTION_CHANGED, true);
    } catch {
      this.#inFlightClicks -= amount;
      this.#pendingClicks += amount;
      this.#events.emit(GAME_EVENTS.CONNECTION_CHANGED, false);
      this.#retryTimer = window.setTimeout(() => {
        this.#retryTimer = null;
        this.#scheduleFlush(0);
      }, 1000);
    } finally {
      this.#isSending = false;
      if (this.#pendingClicks > 0 && !this.#retryTimer) this.#scheduleFlush();
    }
  }

  #handlePageHide = () => {
    if (this.#pendingClicks > 0) {
      this.#api.addClicks(Math.min(this.#pendingClicks, 1000), true).catch(() => {});
      this.#pendingClicks = 0;
    }
  };

  on(eventName, callback, context) {
    this.#events.on(eventName, callback, context);
    return this;
  }

  off(eventName, callback, context) {
    this.#events.off(eventName, callback, context);
    return this;
  }

  destroy() {
    this.#destroyed = true;
    window.clearTimeout(this.#flushTimer);
    window.clearTimeout(this.#retryTimer);
    window.removeEventListener('pagehide', this.#handlePageHide);
    this.#unsubscribe?.();
    this.#events.removeAllListeners();
  }
}
