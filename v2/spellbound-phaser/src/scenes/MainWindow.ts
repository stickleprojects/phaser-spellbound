import { Scene } from "phaser";
import { HudParameters } from "./Hud";
import { GamePlayWindowConfig } from "./GamePlay";

export class MainWindow extends Scene {
    constructor() {
        super('MainWindow');
    }

    update(time, delta) { }
    init(data) {

        // everything is loaded, so display stuff
        // data is the params passed to this scene with this.scene.start(key,data)
        var hudData = new HudParameters(this, 0, 0, this.sys.game.canvas.width, 60);

        const hudScene = this.scene.launch('hud', hudData);

        var playWindow = new GamePlayWindowConfig(this, 0, 50, this.sys.game.canvas.width, this.sys.game.canvas.height - 50)
        this.scene.launch('GamePlay', playWindow);

        const scn = this.scene.manager.getScene('GamePlay');
        scn.events.on('screenmov', (args: object) => {
            hudScene.scene.events.emit('screenmov', args);


        })

    }
    create() {

    }
}