import { GAME_EVENTS } from '../managers/GameManager.js';

export default class ScoreUI {
  constructor(scene, gameManager) {
    this.scene = scene;
    this.gameManager = gameManager;

    this.title = scene.add.text(72, 56, 'Bird Clicker', {
      fontFamily: 'Inter, Segoe UI, sans-serif',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#24475d',
    }).setDepth(100);

    this.scoreText = scene.add.text(scene.scale.width / 2, 92, this.formatScore(gameManager.score), {
      fontFamily: 'Inter, Segoe UI, sans-serif',
      fontSize: '62px',
      fontStyle: 'bold',
      color: '#2f78b7',
      stroke: '#ffffff',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(100);

    this.caption = scene.add.text(scene.scale.width / 2, 148, 'очков', {
      fontFamily: 'Inter, Segoe UI, sans-serif',
      fontSize: '23px',
      color: '#6b899c',
    }).setOrigin(0.5).setDepth(100);

    if (import.meta.env.DEV) {
      this.fpsText = scene.add.text(scene.scale.width - 42, 44, 'FPS: --', {
        fontFamily: 'ui-monospace, Consolas, monospace',
        fontSize: '20px',
        color: '#7390a2',
      }).setOrigin(1, 0).setDepth(100);
    }

    gameManager.on(GAME_EVENTS.SCORE_CHANGED, this.handleScoreChanged, this);
    scene.events.once('shutdown', this.destroy, this);
  }

  formatScore(score) {
    return new Intl.NumberFormat('ru-RU').format(score);
  }

  handleScoreChanged(score) {
    this.scoreText.setText(this.formatScore(score));
    this.scene.tweens.killTweensOf(this.scoreText);
    this.scoreText.setScale(1.08);
    this.scene.tweens.add({
      targets: this.scoreText,
      scale: 1,
      duration: 100,
      ease: 'Back.Out',
    });
  }

  update() {
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(this.scene.game.loop.actualFps)}`);
    }
  }

  destroy() {
    this.gameManager.off(GAME_EVENTS.SCORE_CHANGED, this.handleScoreChanged, this);
    this.title?.destroy();
    this.scoreText?.destroy();
    this.caption?.destroy();
    this.fpsText?.destroy();
  }
}
