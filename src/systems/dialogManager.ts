import { Scene } from "phaser";
import { Dialog, DialogParameters } from "../scenes/dialogs/Dialog";
import { Stack } from "./stack";
import { customEmitter } from "../components/customemitter";

export class SceneWithData {
    scene: Phaser.Scene;
    data: DialogParameters;

    constructor(scene: Phaser.Scene, data: DialogParameters) {
        this.scene = scene;
        this.data = data;

    }

    update(time: number, delta: number) {
        this.scene.update(time, delta);
    }
}
export interface ISceneManager {

    start(key: string, data: any): void;
    stop(key: string | Scene): void;
    getScene(key: string): Phaser.Scene;
    bringToTop(key: string): void;
    getInput(): Phaser.Input.InputPlugin;
}

export class DialogManager {

    private _sceneManager: ISceneManager;
    private _dialogQueue: Stack<SceneWithData>;

    CloseDialogKey: Phaser.Input.Keyboard.Key | undefined;


    constructor(sceneManager: ISceneManager) {

        this._sceneManager = sceneManager;

        this._dialogQueue = new Stack<SceneWithData>();




    }

    closeDialog(id: string) {
        let d = this._dialogQueue.find(x => x.scene._id == id);

        if (d) {
            this.closeScene(d);
        }
    }

    closeTopmost() {
        if (this._dialogQueue.isEmpty()) return;

        let d: SceneWithData | undefined = this._dialogQueue.peek();
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
        this._dialogQueue.remove(x => x.scene._id == s.scene._id);

        if (s?.data.isModal) {
            this.notifyModalClosed(s);
        }

        this.activateTopmostModal();
    }
    clear() {
        while (!this._dialogQueue.isEmpty()) {

            let d = this._dialogQueue.peek();
            if (d) {
                this.closeScene(d);
            }
        }
    }
    notifyModalShow(d: SceneWithData) {
        customEmitter.emitModalDialogShow(d);
    }
    notifyModalClosed(d: SceneWithData) {
        customEmitter.emitModalDialogClose(d);

    }
    deactivateTopmostModal() {
        const m = this._dialogQueue.findLast(x => x.data.isModal);
        if (m) {
            m.scene.scene.setActive(false);
        }
    }
    activateTopmostModal() {
        const m = this._dialogQueue.findLast(x => x.data.isModal);
        if (m) {
            m.scene.scene.setActive(true);
        }
    }

    showDialog<T extends Dialog>(id: string, dparams: DialogParameters): T | undefined {


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

            if (s.data.isModal) {
                //deactiavte the topmost modal
                this.deactivateTopmostModal();
            }
            this._dialogQueue.push(s);

            if (s.data.isModal) {

                this.notifyModalShow(s);
            }
            return existingScene as T;
        }

        return undefined;
    }

    update(time: number, delta: number) {
        if (this._dialogQueue.isEmpty()) return;
        if (!this.CloseDialogKey) {
            this.CloseDialogKey = this._sceneManager.getInput().keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        }

        let d: SceneWithData | undefined = this._dialogQueue.peek();
        if (d) {
            d.update(time, delta);
        }

        if (Phaser.Input.Keyboard.JustDown(this.CloseDialogKey!)) {

            this.closeTopmost();

        }

    }
}
