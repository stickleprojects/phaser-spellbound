/// <reference path="../typings/phaser.d.ts" />

import Phaser from 'phaser';
import Hero from '../entities/Hero';
import Actions from '../dialogs/actions';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.showTileDebugging = false;
  }


  loadSounds() {
    this.load.audio('key', ['assets/sounds/Key1.wav']);
    this.load.audio('jump', 'assets/sounds/jump.wav');
    this.load.audio('die', 'assets/sounds/die.wav');
    this.load.audio('finish', 'assets/sounds/finish.wav');


  }
  preload() {
    this.loadHeroSpriteSheets();

    this.loadSounds();

    this.points = 0;

    this.load.tilemapTiledJSON('level-1', 'assets/tilemaps/level-1.json');

    // we use the tiles from the world-1-sheet so we must load it as a spriesheet rather than an image
    this.load.spritesheet('world-1-sheet', 'assets/tilesets/groundtiles.png', { frameWidth: 32, frameHeight: 32, margin: 1, spacing: 2 });
    this.load.image('clouds-sheet', 'assets/tilesets/Clouds.png');

    this.load.spritesheet('coin-sheet','assets/tiles/coins.png', { frameWidth: 32, frameHeight: 32});

    this.load.spritesheet('key-sheet', 'assets/tiles/key.png', { frameWidth: 32, frameHeight: 32 });
  }


  addMap() {
    this.map = this.make.tilemap({ key: 'level-1' });
    const groundTiles = this.map.addTilesetImage('world-1', 'world-1-sheet');
    const backgroundTiles = this.map.addTilesetImage('clouds', 'clouds-sheet');


    const backgroundLayer = this.map.createStaticLayer('Background', backgroundTiles);
    const backgroundScrollSpeed = 0.6;
    backgroundLayer.setScrollFactor(backgroundScrollSpeed);
    const groundLayer = this.map.createStaticLayer('Ground', groundTiles);

    // tileIDs to colide with (each is offset by 1)
    groundLayer.setCollision([1, 4, 5], true);

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // allow her to jump up outside the world, but not fall off the bottom
    this.physics.world.setBoundsCollision(true, true, false, true);
    
    if (this.showTileDebugging) {
      const debugGraphics = this.add.graphics();
      groundLayer.renderDebug(debugGraphics);
    }

    this.keyGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.finishGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    // default properties for the spikes
    this.spikeGroup = this.physics.add.group({ immovable: true, allowGravity: false });

    // loop all the gameobjects
    this.map.getObjectLayer('Objects').objects.forEach((itm) => {
      if (itm.name == 'start') {
        this.spawnPos = { x: itm.x, y: itm.y };
      } else if (itm.type == 'key') {
        const newKey = this.keyGroup.create(itm.x, itm.y, 'key-sheet');

        newKey.anims.play('key-spinning');

        newKey.setOrigin(0, 1);
        //newKey.setSize(itm.width - 10, itm.height - 10);
        //newKey.setOffset(5, 10);
      } else if (itm.gid === 8) {
        // gid 8 is image 7, which is a spike
        // use the same image frame but -1 because it starts from 0
        // objct origin to bottom left
        const newSpike = this.spikeGroup.create(itm.x, itm.y, 'world-1-sheet', itm.gid - 1);
        newSpike.setOrigin(0, 1);
        newSpike.setSize(itm.width - 10, itm.height - 10);
        newSpike.setOffset(5, 10);

      } else if (itm.name == 'finish') {
        this.finish = this.finishGroup.create(itm.x, itm.y, 'coin-sheet');
        this.finish.anims.play('coin-spinning');
        this.finish.setOrigin(0,1);
        
      }

    });
    this.foregroundLayer = this.map.createStaticLayer('Foreground', groundTiles);

  }

  addHud() {
    this.scorehud = this.add.text(0, 0, 'SCORE: 0', { font: '12px Arial', fill: '#ffffa0' });
    this.scorehud.setScrollFactor(0);


    this.instructions = this.add.text(100,0,'Arrow-Keys to move, Space for menu (only when on ground) \nmenu is mouse-only', { font: '12px Arial', fill: '#ffffa0' });
    this.instructions.setScrollFactor(0);

    this.gameOver = this.add.text(0,100,'Game Over!', { font: '12px Arial', fill: '#ffffa0' });
    this.gameOver.setScrollFactor(0);
    this.gameOver.setVisible(false);

    this.gameoverTween = this.tweens.add( {
      targets: this.gameOver,
      scaleX: { from: 1, to: 2},
      scaleY: { from: 1, to: 2},
      ease: 'Bounce',
      duration: 1000,
      repeat: 1,
      yoyo: true 

    });
    this.gameoverTween.stop();

  }
  create() {

    this.cursorKeys = this.input.keyboard.createCursorKeys();


    this.createKeyAnims();
    this.createHeroAnims();

    // this.addSamplePlatform();

    this.addMap();
    this.addHero();

    this.addHud();

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.bindEvents();

  }

  bindEvents() {
    this.events.on('pause', (args) => {
      console.log(args.config.key + ' paused');
    });
    this.events.on('resume', (args) => {
      console.log(args.config.key + ' resumed');
    });


  }
  addHero() {
    this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y);
    let tgtLayer = this.map.getLayer('Ground').tilemapLayer;
    const groundCollider = this.physics.add.collider(this.hero, tgtLayer);

    // move the hero to be drawn before the foreground

    var foregroundIndex = this.children.getIndex(this.foregroundLayer);

    this.children.moveTo(this.hero, foregroundIndex);

    // collider that doesnt prevent walking throuhg an object
    const spikesCollider = this.physics.add.overlap(this.hero, this.spikeGroup, () => {
      this.hero.kill();
    });

    const keyCollider = this.physics.add.overlap(this.hero, this.keyGroup, (a, b) => {
      b.destroy();
      this.points += 10;
      this.sound.play('key');
    });


    const finishCollider = this.physics.add.overlap (this.hero, this.finishGroup, (a,b)=>{
      
      b.destroy();
      this.points += 100;
      this.sound.play('finish');

      this.hero.kill();

    });

    this.hero.on('jump', () => {

      this.sound.play('jump');
    });
    this.hero.on('died', () => {
      groundCollider.destroy();
      spikesCollider.destroy();
      finishCollider.destroy();
      keyCollider.destroy();
      this.sound.play('die');
      this.hero.body.setCollideWorldBounds(false);
      this.cameras.main.stopFollow();

    });

    this.cameras.main.startFollow(this.hero);

  }
  addSamplePlatform() {
    const platform = this.add.rectangle(220, 240, 260, 10, 0x4BCB7C);
    this.physics.add.existing(platform, true);
    this.physics.add.collider(this.hero, platform);
  }


  loadHeroSpriteSheets() {

    var ss = ['idle', 'run', 'pivot', 'jump', { name: 'flip', image: 'spinjump' }, 'fall', { name: 'die', image: 'bonk' }];
    for (const sheet of ss) {
      let key = sheet;
      let image = sheet;
      if (sheet.name) {
        key = sheet.name;
        image = sheet.image;
      }
      this.load.spritesheet(`hero-${key}-sheet`, `assets/hero/${image}.png`, {
        frameWidth: 32,
        frameHeight: 64,
      });
    }

  }

  createKeyAnims() {
    this.anims.create({
      key: 'key-spinning',
      frames: this.anims.generateFrameNumbers('key-sheet'),
      repeat: -1,
      frameRate: 15,
      showOnStart: true
    });
    
    var fn = this.anims.generateFrameNumbers('coin-sheet');
    var s = this.textures['coin-sheet'];

    this.anims.create({
      key: 'coin-spinning',
      frames: fn,
      repeat: -1,
      
      frameRate: 10,
      showOnStart: true
    });

  }

  createHeroAnims() {

    this.anims.create({
      key: 'hero-idle',
      frames: this.anims.generateFrameNumbers('hero-idle-sheet'),
    });
    this.anims.create({
      key: 'hero-running',
      frames: this.anims.generateFrameNumbers('hero-run-sheet'),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-pivoting',
      frames: this.anims.generateFrameNumbers('hero-pivot-sheet'),
    });
    this.anims.create({
      key: 'hero-jumping',
      frames: this.anims.generateFrameNumbers('hero-jump-sheet'),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-flipping',
      frames: this.anims.generateFrameNumbers('hero-flip-sheet'),
      frameRate: 30,
      repeat: 0,
    });
    this.anims.create({
      key: 'hero-falling',
      frames: this.anims.generateFrameNumbers('hero-fall-sheet'),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-dead',
      frames: this.anims.generateFrameNumbers('hero-die-sheet'),

    });
  }

  update() {
    const cameraBottom = this.cameras.main.getWorldPoint(0, this.cameras.main.height).y;

    // offscreen and dead
    if (this.hero.isDead() && this.hero.getBounds().bottom > cameraBottom + 100) {
      this.hero.destroy();
      this.addHero();

    }

    
    this.scorehud.setText('SCORE: ' + this.points);

    const spacePressed = Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);

    if (spacePressed && this.hero.isOnFloor()) {
      this.input.keyboard.resetKeys();
      this.showDialog();
    }

  }


  showDialog() {

    const key = 'ActionsDialog';
    if (!this.dialog) {

      this.dialog = new Actions(key);
      this.scene.add(key, this.dialog);
    }

    this.scene.launch(key, (src, args) => {
      console.log('you clicked: ' +  args);

      src.scene.stop();
     
      if(!args) {
        alert('Cancelled');
      } else {
        alert(JSON.stringify(args));
      }
      this.scene.resume();
    });
    this.scene.pause();

    // this.time.addEvent({
    //   delay:1000,
    //   callback: ()=>{
    //     this.scene.stop(key);

    //   },
    //   repeat: false
    // })

  }
}


export default Game;