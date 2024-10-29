import Phaser from 'phaser';
import { createAtlas } from './atlascreator';


export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });


    }

    createAtlas22(frameHeight: number, frameWidth: number, imageWidth: number, imageHeight: number) {
        let ret =
        {
            "frames": {
                "charactersprites.png": {
                    "frame": {
                        "x": 0,
                        "y": 0,
                        "w": 256,
                        "h": 64
                    },
                    "rotated": false,
                    "trimmed": false,
                    "spriteSourceSize": {
                        "x": 0,
                        "y": 0,
                        "w": 256,
                        "h": 64
                    },
                    "sourceSize": {
                        "w": 256,
                        "h": 64
                    },
                    "pivot": {
                        "x": 0.5,
                        "y": 0.5
                    }
                }
            },
            "meta": {
                "app": "http://free-tex-packer.com",
                "version": "0.6.7",
                "image": "texture.png",
                "format": "RGBA8888",
                "size": {
                    "w": 256,
                    "h": 64
                },
                "scale": 1
            }
        }

        return ret;
    }
    preload() {
        //this.load.setPath('build');
        //let atlasJSON = this.createAtlas22(32,16,)
        //this.load.spritesheet('characters', 'charactersprites.png', { frameWidth: 16, frameHeight: 32 });

        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.atlas('characters', ['characters.png', 'default_normal_map.png'], 'characters.json');

        this.load.tilemapTiledJSON('levels', 'all_levels.tmj')
        this.load.image('map_foreground', 'c64tiles_foreground.png')
        this.load.image('map_background', 'c64tiles.png')

        //        this.load.audio('knight1', 'sounds/0.mp3',);

        this.load.audioSprite('knight_walk', 'sounds/knight_sounds.json', 'sounds/knight_step_wood.mp3');
        this.load.audioSprite('knight_teleport', 'sounds/teleport-sound.json', 'sounds/teleport-sound-with-reverse.mp3');

        this.load.atlas('objects', ['objectsprites.png', 'default_normal_map.png'], 'objectsprites.json') // { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet('knight_smoke', 'knight_smoke.png', { frameWidth: 16, frameHeight: 32 });

        this.load.spritesheet('border_bottompanel', 'borders_bottompanel.png', { frameWidth: 16, frameHeight: 16 })
        this.load.spritesheet('border_panel', 'borders_menu.png', { frameWidth: 16, frameHeight: 16 })

        this.load.json('levelconfig', 'levelconfig.json')
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainWindow');
    }
}
