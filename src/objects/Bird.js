import Phaser from 'phaser';

export default class Bird extends Phaser.GameObjects.Image {
  constructor(scene, x, y, gameManager) {
    super(scene, x, y, 'bird');

    this.gameManager = gameManager;
    this.baseScale = Math.min(scene.scale.height * 0.58 / this.height, 0.64);
    this.clickDirection = 1;
    this.lastSoundKey = null;

    scene.add.existing(this);
    this.setScale(this.baseScale);
    this.setInteractive(
      new Phaser.Geom.Circle(this.width / 2, this.height / 2, this.width * 0.39),
      Phaser.Geom.Circle.Contains,
      true,
    );
    this.on('pointerdown', this.handleClick, this);
    this.once('destroy', this.cleanUp, this);

    const soundKeys = [
      'bird-click',
      ...Array.from({ length: 6 }, (_, index) => `bird-click-${index + 2}`),
    ];
    this.clickSounds = soundKeys.flatMap((key) => [
      scene.sound.add(key, { volume: 0.55 }),
      scene.sound.add(key, { volume: 0.55 }),
    ]);
  }

  handleClick(pointer) {
    this.gameManager.addScore(1);
    this.playClickAnimation();
    this.createFloatingScore(pointer.worldX, pointer.worldY);
    this.playClickSound();
  }

  playClickAnimation() {
    this.scene.tweens.killTweensOf(this);
    this.clickDirection *= -1;

    this.scene.tweens.chain({
      targets: this,
      tweens: [
        {
          scaleX: this.baseScale * 0.9,
          scaleY: this.baseScale * 0.9,
          angle: 4 * this.clickDirection,
          duration: 55,
          ease: 'Quad.Out',
        },
        {
          scaleX: this.baseScale,
          scaleY: this.baseScale,
          angle: 0,
          duration: 65,
          ease: 'Back.Out',
        },
      ],
    });
  }

  createFloatingScore(x, y) {
    const jitter = Phaser.Math.Between(-12, 12);
    const score = this.scene.add.text(x + jitter, y - 16, '+1', {
      fontFamily: 'Inter, Segoe UI, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#2478bd',
      stroke: '#ffffff',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(50);

    this.scene.tweens.add({
      targets: score,
      y: score.y - 92,
      alpha: 0,
      scale: 1.18,
      duration: 620,
      ease: 'Cubic.Out',
      onComplete: () => score.destroy(),
    });
  }

  playClickSound() {
    const availableSounds = this.clickSounds.filter(
      (candidate) => candidate.key !== this.lastSoundKey,
    );
    const sound = Phaser.Utils.Array.GetRandom(availableSounds);
    this.lastSoundKey = sound.key;

    if (sound.isPlaying) sound.stop();
    sound.play();
  }

  cleanUp() {
    this.off('pointerdown', this.handleClick, this);
    this.scene?.tweens.killTweensOf(this);
    this.clickSounds?.forEach((sound) => sound.destroy());
    this.clickSounds = [];
  }
}
