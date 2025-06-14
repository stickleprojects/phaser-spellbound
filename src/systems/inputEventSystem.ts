import { defineSystem } from "bitecs";
import { customEmitter } from "../components/customemitter";

export const KEYEVENT_PICKUP_ITEM = "pickup";
export const KEYEVENT_FOLLOW_PLAYER = "followplayer";
export const KEYEVENT_DROP_ITEM = "drop";
export const KEYEVENT_TOGGLE_DEBUG = "toggledebug";
export const KEYEVENT_TELEPORT = "teleport";
export const KEYEVENT_CLOSEDIALOG = "closedialog";
export const KEYEVENT_OPENDIALOG = "opendialog";

export function InputEventSystem(input: Phaser.Input.InputPlugin) {
  const PickupItemKey: Phaser.Input.Keyboard.Key = input.keyboard!.addKey(
    Phaser.Input.Keyboard.KeyCodes.P
  );
  const DropItemKey: Phaser.Input.Keyboard.Key = input.keyboard!.addKey(
    Phaser.Input.Keyboard.KeyCodes.X
  );
  const ToggleDebugKey: Phaser.Input.Keyboard.Key = input.keyboard!.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );
  const ToggleFollowingPlayerKey: Phaser.Input.Keyboard.Key =
    input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

  const OpenDialogKey: Phaser.Input.Keyboard.Key = input.keyboard!.addKey(
    Phaser.Input.Keyboard.KeyCodes.R
  );
  const TeleportKey: Phaser.Input.Keyboard.Key = input.keyboard!.addKey(
    Phaser.Input.Keyboard.KeyCodes.T
  );

  return defineSystem((world: IWorld) => {
    if (Phaser.Input.Keyboard.JustDown(PickupItemKey)) {
      customEmitter.emitPickupItem("");
    }
    if (Phaser.Input.Keyboard.JustDown(ToggleFollowingPlayerKey)) {
      customEmitter.emitToggleFollowPlayer();
    }

    if (Phaser.Input.Keyboard.JustDown(OpenDialogKey)) {
      customEmitter.emitOpenDialogs();
    }

    if (Phaser.Input.Keyboard.JustDown(TeleportKey)) {
      customEmitter.emitTeleport();
    }

    if (Phaser.Input.Keyboard.JustDown(DropItemKey!)) {
      //this.flags.FollowingPlayer = !this.flags.FollowingPlayer;
      customEmitter.emitDropItem("");
    }

    if (Phaser.Input.Keyboard.JustDown(ToggleDebugKey!)) {
      customEmitter.emitToggleDebug();
    }
    return world;
  });
}
