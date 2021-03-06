import Phaser from "phaser";
import config from "./config";
import GameScene from "./scenes/Game";
import HeroAnimationDemo from "./scenes/HeroAnimationDemo";

//import Actions from './dialogs/actions';

new Phaser.Game(
  Object.assign(config, {
    scene: [HeroAnimationDemo],
  })
);
