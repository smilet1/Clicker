import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
const viewportScale = Math.min(
  window.innerWidth / GAME_WIDTH,
  window.innerHeight / GAME_HEIGHT,
);
const renderResolution = Math.min(
  Math.max((window.devicePixelRatio || 1) * viewportScale, 1),
  2,
);

export default {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#eef8ff',
  transparent: false,
  antialias: true,
  pixelArt: false,
  resolution: renderResolution,
  render: {
    roundPixels: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  input: {
    activePointers: 4,
  },
  scene: [BootScene, PreloadScene, GameScene],
};
