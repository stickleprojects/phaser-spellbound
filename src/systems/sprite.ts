import { DEBUG_MODE } from "../../globals"; // Import DEBUG_MODE
import { defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";
import Position from "../components/position";
import Sprite from "../components/sprite";

export default function createSpriteSystem(
  scene: Phaser.Scene,
  textures: string[]
) {
  const spritesById = new Map<number, Phaser.GameObjects.Sprite>();

  const spriteQuery = defineQuery([Position, Sprite]);
  const spriteQueryEnter = enterQuery(spriteQuery);
  const spriteQueryExit = exitQuery(spriteQuery);

  return defineSystem((world) => {
    const entitiesEntered = spriteQueryEnter(world);
    for (let i = 0; i < entitiesEntered.length; i++) {
      const id = entitiesEntered[i];
      const texId = Sprite.texture[id];
      const texture = textures[texId];

      spritesById.set(id, scene.add.sprite(0, 0, texture));
    }

    const entities = spriteQuery(world);
    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i];

      const sprite = spritesById.get(id);
      if (!sprite) {
        // log an error
        continue;
      }

      sprite.x = Position.x[id];
      sprite.y = Position.y[id];
    }

    const entitiesExited = spriteQueryExit(world);
    for (let i = 0; i < entitiesExited.length; ++i) {
      const id = entitiesEntered[i];
      spritesById.delete(id);
    }

    return world;
  });
}
