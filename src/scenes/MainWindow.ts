import { Scene } from "phaser";
import { HudParameters } from "./Hud";
import { GamePlayWindowConfig } from "./GamePlay";
import { CopyrightPanelParameters } from "./CopyrightPanel";

export class MainWindow extends Scene {

    private _hudHeight = 60;
    private _copyrightHeight = 120;

    hudScene: Phaser.Scenes.ScenePlugin;
    copyrightScene: Phaser.Scenes.ScenePlugin;
    constructor() {
        super('MainWindow');
    }

    update(time, delta) { }

    showHud() {
        var hudData = new HudParameters(this, 0, 0, this.sys.game.canvas.width, this._hudHeight);

        this.hudScene = this.scene.launch('hud', hudData);

    }
    wireUpEvents() {
        const scn = this.scene.manager.getScene('GamePlay');
        scn.events.on('screenmov', (args: object) => {
            this.hudScene.scene.events.emit('screenmov', args);


        })

        scn.events.on('updateflags', (args: object) => {
            this.hudScene.scene.events.emit('updateflags', args);
        })

    }
    showCopyright() {

        const height = this._copyrightHeight;
        var copyrightData = new CopyrightPanelParameters(this, 0,
            this.sys.game.canvas.height - height, this.sys.game.canvas.width, height);

        this.copyrightScene = this.scene.launch('copyright', copyrightData);

    }
    showGamePlayWindow() {

        var top = this._hudHeight;
        var height = this.sys.game.canvas.height - this._hudHeight - this._copyrightHeight;

        var playWindow = new GamePlayWindowConfig(this, 0, top,
            this.sys.game.canvas.width, height);

        this.scene.launch('GamePlay', playWindow);

    }
    init() {

        // everything is loaded, so display stuff
        // data is the params passed to this scene with this.scene.start(key,data)
        this.showHud();

        this.showGamePlayWindow();

        this.wireUpEvents();

        this.showCopyright();

    }
    create() {

    }
}