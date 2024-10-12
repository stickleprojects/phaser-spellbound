import { Scene } from "phaser";
import { GamePlay } from "./GamePlay";

export class GameplayWindow extends Scene {
    playscene: Scene;

    constructor() {
        super('GameplayWindow');
    }

    create() {

        this.playscene = this.scene.start()
    }
}
