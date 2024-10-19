import { defineSystem } from "bitecs";
import { customEmitter } from "../components/customemitter";

export const KEYEVENT_PICKUP_ITEM = "pickup";
export const KEYEVENT_FOLLOW_PLAYER = "followplayer";
export const KEYEVENT_DROP_ITEM = "drop";
export const KEYEVENT_TOGGLE_DEBUG = "toggledebug";
export const KEYEVENT_TELEPORT = "teleport";


export function InputEventSystem(input: Phaser.Input.InputPlugin) {

    const PickupItemKey: Phaser.Input.Keyboard.Key = input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    const DropItemKey: Phaser.Input.Keyboard.Key = input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    const ToggleDebugKey: Phaser.Input.Keyboard.Key = input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const ToggleFollowingPlayerKey: Phaser.Input.Keyboard.Key = input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    const TeleportKey: Phaser.Input.Keyboard.Key = input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.T);


    return defineSystem((world: IWorld) => {

        if (Phaser.Input.Keyboard.JustDown(PickupItemKey)) {
            customEmitter.emit(KEYEVENT_PICKUP_ITEM);
        }
        if (Phaser.Input.Keyboard.JustDown(ToggleFollowingPlayerKey)) {
            customEmitter.emit(KEYEVENT_FOLLOW_PLAYER);
        }


        if (Phaser.Input.Keyboard.JustDown(TeleportKey)) {
            customEmitter.emit(KEYEVENT_TELEPORT);
        }


        if (Phaser.Input.Keyboard.JustDown(DropItemKey!)) {
            //this.flags.FollowingPlayer = !this.flags.FollowingPlayer;
            customEmitter.emit(KEYEVENT_DROP_ITEM);
        }

        if (Phaser.Input.Keyboard.JustDown(ToggleDebugKey!)) {

            customEmitter.emit(KEYEVENT_TOGGLE_DEBUG);

        }
        return world;
    });

}