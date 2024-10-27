import { Scene } from "phaser";
import { HudParameters } from "./Hud";
import { GamePlayWindowConfig } from "./GamePlay";
import { CopyrightPanelParameters } from "./CopyrightPanel";
import { BottomPanelParameters } from "./BottomPanel";


import { Rectangle } from "../config/levelconfig";

import { MenuDialogParameters } from "./dialogs/MenuDialog";
import { DialogManager, ISceneManager } from "../systems/dialogManager";
import { customEmitter, GAMEEVENT_MODALDIALOG_CLOSE, GAMEEVENT_MODALDIALOG_SHOW } from "../components/customemitter";
import { KEYEVENT_CLOSEDIALOG } from "../systems/inputEventSystem";

export class MainWindow extends Scene implements ISceneManager {

    private _hudHeight = 60;
    private _copyrightHeight = 120;
    private _dialogManager: DialogManager;
    CloseDialogKey: any;


    constructor() {
        super('MainWindow');

    }
    start(key: string, data: any): void {
        this.scene.launch(key, data);
    }
    stop(key: string | Scene): void {
        this.scene.stop(key);

    }
    getScene(key: string): Phaser.Scene {
        return this.scene.get(key);
    }
    bringToTop(key: string): void {
        this.scene.bringToTop(key);
    }


    update(time, delta) {

        if (Phaser.Input.Keyboard.JustDown(this.CloseDialogKey)) {
            customEmitter.emit(KEYEVENT_CLOSEDIALOG);
        }

    }

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

    getGameplayScene(): Scene {
        return this.scene.manager.getScene('GamePlay')!;
    }
    getCopyrightScene(): Scene {
        return this.scene.manager.getScene('copyright')!;
    }

    private closeLastDialog() {

        this._dialogManager.closeTopmost();


    }
    wireUpEvents() {
        customEmitter.on(GAMEEVENT_MODALDIALOG_CLOSE, (data) => {

            if (!this._dialogManager.isModalOpen()) {
                const s = this.getGameplayScene();
                s.scene.setActive(true);
            }

        });


        customEmitter.on(KEYEVENT_CLOSEDIALOG, () => {
            this.closeLastDialog();

        });
        customEmitter.on(GAMEEVENT_MODALDIALOG_SHOW, (data) => {
            const s = this.getGameplayScene();
            s.scene.setActive(false);

        });

    }
    showCopyrightPanel() {

        const height = this._copyrightHeight;
        var copyrightData = new CopyrightPanelParameters(this, 0,
            this.sys.game.canvas.height - height, this.sys.game.canvas.width - 120, height);

        this.scene.launch('copyright', copyrightData);

    }
    showInventoryPanel() {
        const height = this._copyrightHeight;
        var data = new BottomPanelParameters(this, 0,
            this.sys.game.canvas.height - height, this.sys.game.canvas.width - 120, height);

        this.scene.launch('inventory', data);
    }
    showGamePlayWindow() {

        var top = this._hudHeight;
        var height = this.sys.game.canvas.height - this._hudHeight - this._copyrightHeight;

        if (!this._dialogManager) {
            throw ("Dualogmanager not set");
        }
        var playWindow = new GamePlayWindowConfig(this, 0, top,
            this.sys.game.canvas.width, height
            , this._dialogManager);

        this.scene.launch('GamePlay', playWindow);

    }


    init() {

        // everything is loaded, so display stuff
        // data is the params passed to this scene with this.scene.start(key,data)



        this._dialogManager = new DialogManager(this);


        this.showHud();

        this.showCopyrightPanel();

        this.showInventoryPanel();

        this.showGamePlayWindow();

        this.wireUpEvents();


    }
    create() {


        this.CloseDialogKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);


    }
}