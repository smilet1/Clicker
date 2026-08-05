import Phaser from 'phaser';
import Bird from '../objects/Bird.js';
import ScoreUI from '../ui/ScoreUI.js';
import GameManager from '../managers/GameManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const { width, height } = this.scale;

    this.createBackground(width, height);
    this.gameManager = new GameManager();
    this.bird = new Bird(this, width / 2, height / 2 + 70, this.gameManager);
    this.scoreUI = new ScoreUI(this, this.gameManager);

    this.events.once('shutdown', () => {
      this.gameManager.destroy();
    });
  }

  createBackground(width, height) {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xf9fdff, 0xf9fdff, 0xe5f4fc, 0xe5f4fc, 1);
    graphics.fillRect(0, 0, width, height);

    graphics.fillStyle(0xffffff, 0.48);
    graphics.fillCircle(width * 0.15, height * 0.22, 92);
    graphics.fillCircle(width * 0.84, height * 0.68, 128);
    graphics.fillStyle(0xaed9ef, 0.16);
    graphics.fillCircle(width * 0.86, height * 0.18, 58);
    graphics.fillCircle(width * 0.12, height * 0.78, 74);
  }

  update() {
    this.scoreUI?.update();
  }
}
