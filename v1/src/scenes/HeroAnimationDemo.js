/// <reference path="../typings/phaser.d.ts" />

import Phaser from "phaser";

import Hero from "../entities/Hero";

class HeroAnimationDemo extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    this.showTileDebugging = false;
    this.heros = [];
  }

  preload() {
    this.loadHeroSpriteSheets();
  }

  addHud() {
    this.scorehud = this.add.text(0, 0, "SCORE: 0", {
      font: "12px Arial",
      fill: "#ffffa0",
    });
    this.scorehud.setScrollFactor(0);

    this.instructions = this.add.text(
      100,
      0,
      "Arrow-Keys to move, Space for menu (only when on ground) \nmenu is mouse-only",
      { font: "12px Arial", fill: "#ffffa0" }
    );
    this.instructions.setScrollFactor(0);

    this.gameOver = this.add.text(0, 100, "Game Over!", {
      font: "12px Arial",
      fill: "#ffffa0",
    });
    this.gameOver.setScrollFactor(0);
    this.gameOver.setVisible(false);

    this.gameoverTween = this.tweens.add({
      targets: this.gameOver,
      scaleX: { from: 1, to: 2 },
      scaleY: { from: 1, to: 2 },
      ease: "Bounce",
      duration: 1000,
      repeat: 1,
      yoyo: true,
    });
    this.gameoverTween.stop();
  }
  create() {
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.createHeroAnims();

    this.addHeros();

    this.addHud();
  }

  addHeros() {
    // create a hero per anim

    let xmin = 100;
    let xmax = 300;
    let xgap = 50;
    let ygap = 60;
    let ymin = 100;

    let x = xmin;
    let y = ymin;

    for (const a of this.heroAnims) {
      var hero = new Hero(this, x, y);
      hero.body.setAllowGravity(false);

      hero.name = a.key;
      hero.play("hero-" + a.anim);

      x += xgap;

      if (x > xmax) {
        x = xmin;
        y += ygap;
      }

      this.heros.push(hero);
    }
  }

  loadHeroSpriteSheets() {
    const sheetNames = [
      "attack",
      "walk",
      "fall",
      "idle",
      "dead",
      "jump",
      "pivot",
      "run",
    ];
    for (const sn of sheetNames) {
      this.load.spritesheet("hero-" + sn, "assets/hero/knight_" + sn + ".png", {
        frameWidth: 32,
        frameHeight: 64,
      });
    }
  }
  createHeroAnims() {
    this.heroAnims = [
      { key: "attack", anim: "attacking" },
      { key: "fall", anim: "falling", frameCount: 2 },
      { key: "walk", anim: "walking" },
      { key: "dead", anim: "dead" },
      { key: "idle", anim: "idle" },

      { key: "jump", anim: "jumping" },
      { key: "pivot", anim: "pivoting" },

      { key: "run", anim: "running" },
      { key: "walk", anim: "walking" },
    ];

    for (const anim of this.heroAnims) {
      const frameCount = 30 || anim.frameCount;
      const f = this.anims.generateFrameNumbers("hero-" + anim.key, {
        start: 0,
        end: frameCount,
      });

      this.anims.create({
        key: "hero-" + anim.anim,

        frames: f,

        frameRate: 60,
        repeat: -1,
      });
    }
  }

  update() {
    const cameraBottom = this.cameras.main.getWorldPoint(
      0,
      this.cameras.main.height
    ).y;

    this.scorehud.setText("SCORE: " + this.points);

    const spacePressed = Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);

    if (spacePressed && this.hero.isOnFloor()) {
      this.input.keyboard.resetKeys();
      this.showDialog();
    }
  }
}
export default HeroAnimationDemo;
