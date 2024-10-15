import { Scene } from "phaser";
import { HudParameters } from "./Hud";
import { GamePlayWindowConfig } from "./GamePlay";
import { CopyrightPanelParameters } from "./CopyrightPanel";
import { BottomPanelParameters } from "./BottomPanel";
import { InventoryEventArgs } from "../inventory";

export class MainWindow extends Scene {

    private _hudHeight = 60;
    private _copyrightHeight = 120;


    constructor() {
        super('MainWindow');
    }

    update(time, delta) { }

    showHud() {
        var hudData = new HudParameters(this, 0, 0, this.sys.game.canvas.width, this._hudHeight);

        this.scene.launch('hud', hudData);

    }
    getHudScene(): Scene {
        return this.scene.manager.getScene('hud')!;
    }
    getInventoryScene(): Scene {
        return this.scene.manager.getScene('inventory')!;
    }
    getCopyrightScene(): Scene {
        return this.scene.manager.getScene('copyright')!;
    }
    wireUpEvents() {
        const scn = this.scene.manager.getScene('GamePlay');
        scn!.events.on('screenmov', (args: object) => {
            this.getHudScene().events.emit('screenmov', args);


        })

        scn!.events.on('updateflags', (args: object) => {
            this.getHudScene().events.emit('updateflags', args);
        })

        scn!.events.on('itemadded', (args: InventoryEventArgs) => {
            this.getInventoryScene().events.emit('itemadded', args);
        })
        scn!.events.on('itemremoved', (args: InventoryEventArgs) => {
            this.getInventoryScene().events.emit('itemremoved', args);
        })

    }
    showCopyright() {

        const height = this._copyrightHeight;
        var copyrightData = new CopyrightPanelParameters(this, 0,
            this.sys.game.canvas.height - height, this.sys.game.canvas.width - 120, height);

        this.scene.launch('copyright', copyrightData);

    }
    showInventory() {
        const height = this._copyrightHeight;
        var data = new BottomPanelParameters(this, 0,
            this.sys.game.canvas.height - height, this.sys.game.canvas.width - 120, height);

        this.scene.launch('inventory', data);
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

        this.showCopyright();

        this.showInventory();

        this.showGamePlayWindow();

        this.wireUpEvents();



    }
    create() {

    }
}