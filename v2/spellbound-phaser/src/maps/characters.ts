export default function createCharacterMap() {

    const characterMap = new Map<String, {x:integer,y: integer}>();
    characterMap.set("left1", {x:0,y:0});
    characterMap.set("left2", {x:1,y:0});
    
    characterMap.set("ladyrosmar_right", {x:4,y:0});
    characterMap.set("ladyrosmar_left", {x:5,y:0});
    characterMap.set("thor_right", {x:6,y:0});
    characterMap.set("thor_left", {x:7,y:0});
    characterMap.set("florin_right", {x:8,y:0});
    characterMap.set("florin_left", {x:9,y:0});
    characterMap.set("banshee_right", {x:10,y:0});
    characterMap.set("banshee_left", {x:11,y:0});
    characterMap.set("samsun_right", {x:12,y:0});
    characterMap.set("samsun_left", {x:13,y:0});
    characterMap.set("elrand_right", {x:14,y:0});
    characterMap.set("elrand_left", {x:15,y:0});
    characterMap.set("knight_right", {x:0,y:1});
    characterMap.set("orik_right", {x:6,y:1});
    characterMap.set("wizard_right", {x:4,y:1});
    
    return characterMap;
    
}

