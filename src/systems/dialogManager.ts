import { Scene } from "phaser";
import { Dialog, DialogParameters } from "../scenes/dialogs/Dialog";
import { Stack } from "./stack";
import { customEmitter, GAMEEVENT_MODALDIALOG_CLOSE, GAMEEVENT_MODALDIALOG_SHOW } from "../components/customemitter";

class SceneWithData {
    scene: Phaser.Scene;
    data: DialogParameters;

    constructor(scene: Phaser.Scale, data: DialogParameters) {
        this.scene = scene;
        this.data = data;

    }
}
export interface ISceneManager {

    start(key: string, data: any): void;
    stop(key: string | Scene): void;
    getScene(key: string): Phaser.Scene;
    bringToTop(key: string): void;
}

export class DialogManager {
    private _sceneManager: ISceneManager;
    private _dialogQueue: Stack<SceneWithData>;


    constructor(sceneManager: ISceneManager) {

        this._sceneManager = sceneManager;

        this._dialogQueue = new Stack<SceneWithData>();


    }


    closeTopmost() {
        if (this._dialogQueue.isEmpty()) return;

        let d: SceneWithData | undefined = this._dialogQueue.pop();
        if (d) {
            this.closeScene(d);
        }
    }

    isModalOpen(): boolean {
        return this._dialogQueue.any((x) => x.data.isModal);

    }
    closeScene(s: SceneWithData) {
        console.log("shutting dialog ", s.scene);
        this._sceneManager.stop(s.scene);

        if (s?.data.isModal) {
            this.notifyModalClosed(s);
        }

    }
    clear() {
        while (!this._dialogQueue.isEmpty()) {

            let d = this._dialogQueue.pop();
            if (d) {
                this.closeScene(d);
            }
        }
    }
    notifyModalShow(d: SceneWithData) {
        customEmitter.emit(GAMEEVENT_MODALDIALOG_SHOW, d);
    }
    notifyModalClosed(d: SceneWithData) {
        customEmitter.emit(GAMEEVENT_MODALDIALOG_CLOSE, d);

    }
    showDialog<T extends Dialog>(id: string, dparams: DialogParameters): T {


        let existingScene = this._sceneManager.getScene(id);
        if (existingScene) {
            this._sceneManager.bringToTop(id);

        }


        this._sceneManager.start(id, dparams);

        this._sceneManager.bringToTop(id);

        existingScene = this._sceneManager.getScene(id)
        if (existingScene) {
            console.log('push scene ', existingScene);

            const s = new SceneWithData(existingScene, dparams);
            this._dialogQueue.push(s);

            if (s.data.isModal) {
                this.notifyModalShow(s);
            }
            return existingScene as T;
        }

    }
}
