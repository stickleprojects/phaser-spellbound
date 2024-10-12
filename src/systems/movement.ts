import { defineQuery, defineSystem } from "bitecs";
import Position from "../components/position";
import Input, { Direction } from "../components/input";
import Velocity from "../components/velocity";

export default function createMovementSystem() {
    const movementQuery = defineQuery([Position, Input])

    return defineSystem((world) => {

        const entities = movementQuery(world)

        for (let i = 0; i < entities.length; i++) {
            const id = entities[i]
            const direction = Input.direction[id]
            const speed = Input.speed[id]

            switch (direction) {
                case Direction.None:
                    Velocity.x[id] = 0
                    Velocity.y[i] = 0
                    break
                case Direction.Left:
                    Velocity.x[id] = -speed
                    Velocity.y[id] = 0

                    break
                case Direction.Right:
                    Velocity.x[id] = speed
                    Velocity.y[id] = 0

                    break

                case Direction.Up:
                    Velocity.x[id] = 0
                    Velocity.y[id] = -speed

                    break

                case Direction.Down:
                    Velocity.x[id] = 0
                    Velocity.y[id] = speed

                    break


            }
            Position.x[id] += Velocity.x[id]
            Position.y[id] += Velocity.y[id]

            console.log(Position.x[id]);

        }

        return world;
    })
}