import Phaser from 'phaser';
import { changeTextureColor } from '../TextureColourChanger';


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

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.tilemapTiledJSON('levels', 'all_levels.tmj')
        this.load.image('map_foreground', 'c64tiles_foreground.png')
        this.load.image('map_background', 'c64tiles.png')
        this.load.spritesheet('characters', 'charactersprites.png', { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet('objects', 'objectsprites.png', { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet('knight_smoke', 'knight_smoke.png', { frameWidth: 16, frameHeight: 32 });

        this.load.spritesheet('border_bottompanel', 'borders_bottompanel.png', { frameWidth: 16, frameHeight: 16 })
        this.load.spritesheet('border_panel_original', 'borders_menu.png', { frameWidth: 16, frameHeight: 16 })

        this.load.json('levelconfig', 'levelconfig.json')
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        changeTextureColor('border_panel_original', 'border_panel', '#ffffff', '#ffffff', this.textures);
        changeTextureColor('border_panel_original', 'border_panel_white', '#ffffff', '#ffffff', this.textures);
        changeTextureColor('border_panel_original', 'border_panel_blue', '#ffffff', '#0000ff0', this.textures);
        changeTextureColor('border_panel_original', 'border_panel_red', '#ffffff', '#ff0000', this.textures);
        changeTextureColor('border_panel_original', 'border_panel_yellow', '#ffffff', '#ffff00', this.textures);
        changeTextureColor('border_panel_original', 'border_panel_green', '#ffffff', '#00ff00', this.textures);


        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainWindow');
    }
}
