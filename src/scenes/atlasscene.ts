import { Scene } from "phaser";

export class AtlasScene extends Scene {
    playscene: Scene;
    map: Phaser.Tilemaps.Tilemap;
    bk: Phaser.Tilemaps.TilemapLayer | null;

    constructor() {
        super('AtlasScene');


    }

    preload() {
        this.load.setPath('assets');
        this.load.json('c1', 'maps\\test.json')
        this.load.tilemapTiledJSON('c64map', 'maps\\atlasmap1.tmj');
        //this.load.atlas('c64sprites', ['c64sprites.png', 'default_normal_map.png'], 'c64sprites.json');

        const imagesToLoad = ['candle5', 'candle6', 'clock1', 'mirror1', 'grass1', 'mushroom1'
            , 'lift-panel1'
            , 'mushroom1'
            , 'mushroom2'
            , 'mushroom3'
            , 'mushroom4'
            , 'mushroom5'
            , 'picture1'
            , 'picture2'
            , 'picture3'
            , 'picture4'
            , 'picture5'
            , 'portrait1'
            , 'portrait2'
            , 'portrait3'
            , 'shield1'
            , 'shield2'
            , 'shield3'
            , 'shield4'
        ]

        imagesToLoad.forEach((i: string) => {
            const filename = i + '.png'
            this.load.image(filename, 'c64spritesheets\\' + filename);
        })
    }
    create() {

        const j = this.cache.json.get('c1');




        this.map = this.make.tilemap({ key: 'c64map' });

        let loadedTilesets: any[] = []
        this.map.imageCollections.forEach((ic: Phaser.Tilemaps.ImageCollection) => {
            ic.images.forEach((img: any) => {

                // the img.image is "../c64spritesheets/candle5.png"
                // in the atlas the key is "c64sprites.png/candle5.png"

                let tmpname = img.image;
                tmpname = tmpname.replace('../c64spritesheets/', '');
                if (this.textures.exists(tmpname)) {
                    console.log('found');


                    const tmi = this.map.addTilesetImage(img.image, tmpname);
                    loadedTilesets.push(tmi);
                }

            });
        })

        this.bk = this.map.createLayer('Tile Layer 1', loadedTilesets, 0, 0);

        const debugWindow = this.add.graphics();
        this.map.renderDebug(debugWindow);

    }


}
