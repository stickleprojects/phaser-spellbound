import { DEBUG_MODE } from "../../globals"; // Import DEBUG_MODE
import { defineQuery, defineSystem } from "bitecs";
import Input, { Direction, Jumping } from "../components/input";

export default function createInputSystem(
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys
) {
  const movableEntityQuery = defineQuery([Input]);

  return defineSystem((world) => {
    if (cursors != null) {
      const entities = movableEntityQuery(world);
      for (let i = 0; i < entities.length; i++) {
        const id = entities[i];

        if (cursors.left.isDown) {
          Input.direction[id] = Direction.Left;
        } else if (cursors.right.isDown) {
          Input.direction[id] = Direction.Right;
        } else if (cursors.up.isDown) {
          Input.direction[id] = Direction.Up;
        } else if (cursors.down.isDown) {
          Input.direction[id] = Direction.Down;
        } else if (cursors.space.isDown) {
          Input.jump[id] = Jumping.True;
        } else {
          Input.direction[id] = Direction.None;
          Input.jump[id] = Jumping.False;
        }
      }
    }
    return world;
  });
}
