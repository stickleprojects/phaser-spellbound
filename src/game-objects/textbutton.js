import Phaser from 'phaser';

export class TextButton extends Phaser.GameObjects.Text {
    constructor(scene, name, x, y, text, style, callback) {
        super(scene, x, y, text, style);


        this.clickCallback = callback;
        this.name = name;

        this.setInteractive({ useHandCursor: true })
            .on('pointerup', (e) => {
                this.clickCallback({ src: this, args: e });
            }, this);


    }
}