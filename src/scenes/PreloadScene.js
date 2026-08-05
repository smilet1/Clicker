import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    const track = this.add.rectangle(centerX, centerY, 420, 14, 0xd8eaf5).setOrigin(0.5);
    const bar = this.add.rectangle(centerX - 210, centerY, 0, 14, 0x4e9de0).setOrigin(0, 0.5);
    const label = this.add.text(centerX, centerY - 56, 'Готовим птичку…', {
      fontFamily: 'Inter, Segoe UI, sans-serif',
      fontSize: '30px',
      color: '#33566d',
    }).setOrigin(0.5);

    this.load.image('bird', 'assets/images/bird.png');
    this.load.audio('bird-click', 'assets/audio/bird-click.ogg');
    for (let index = 2; index <= 7; index += 1) {
      this.load.audio(`bird-click-${index}`, `assets/audio/bird-click-${index}.ogg`);
    }
    this.load.on('progress', (progress) => {
      bar.width = 420 * progress;
    });
    this.load.once('complete', () => {
      track.destroy();
      bar.destroy();
      label.destroy();
    });
  }

  create() {
    this.scene.start('GameScene');
  }
}
