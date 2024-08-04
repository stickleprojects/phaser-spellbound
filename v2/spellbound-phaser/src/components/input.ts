import { defineComponent, Types } from "bitecs";

export const Input = defineComponent({
    direction: Types.ui8,
    speed: Types.ui8,
    jump: Types.i8
})

export enum Direction {
    None, Left, Right, Up, Down 
}

export enum Jumping {
    False,
    True
    
}

export default Input
