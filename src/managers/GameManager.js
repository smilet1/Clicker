import Phaser from 'phaser';

export const GAME_EVENTS = Object.freeze({
  SCORE_CHANGED: 'score-changed',
});

export default class GameManager {
  #score = 0;
  #events = new Phaser.Events.EventEmitter();

  get score() {
    return this.#score;
  }

  addScore(amount = 1) {
    if (!Number.isFinite(amount) || amount <= 0) return this.#score;

    this.#score += amount;
    this.#events.emit(GAME_EVENTS.SCORE_CHANGED, this.#score, amount);
    return this.#score;
  }

  on(eventName, callback, context) {
    this.#events.on(eventName, callback, context);
    return this;
  }

  off(eventName, callback, context) {
    this.#events.off(eventName, callback, context);
    return this;
  }

  destroy() {
    this.#events.removeAllListeners();
  }
}
