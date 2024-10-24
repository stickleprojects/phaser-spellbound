import { Scene } from "phaser";
import { Dialog, DialogParameters } from "../scenes/dialogs/Dialog";
import { Stack } from "./stack";

export interface ISceneManager {

    start(key: string, data: any): void;
    stop(key: string | Scene): void;
    getScene(key: string): Phaser.Scene;
    bringToTop(key: string): void;
}

export class DialogManager {
    private _sceneManager: ISceneManager;
    private _dialogQueue: Stack<Scene>;

    constructor(sceneManager: ISceneManager) {

        this._sceneManager = sceneManager;

        this._dialogQueue = new Stack<Dialog>();

    }


    closeTopmost() {
        const d = this._dialogQueue.pop();
        if (d) {

            console.log("shutting dialog ", d);
            this._sceneManager.stop(d);
        }
    }
    clear() {
        while (!this._dialogQueue.isEmpty()) {

            const d = this._dialogQueue.pop();
            if (d) {

                console.log("shutting dialog ", d);
                this._sceneManager.stop(d);
            }
        }
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
            this._dialogQueue.push(existingScene);

            return existingScene as T;
        }

    }
}
