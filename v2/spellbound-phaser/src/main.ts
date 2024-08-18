import { Boot } from './scenes/Boot';
// import { Game as MainGame } from './scenes/Game';
// import { GameOver } from './scenes/GameOver';
import { GamePlay } from './scenes/GamePlay';
// import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 9.8},
            debug: true
        }
    },
    scene: [
        
         Boot,
         Preloader,
         GamePlay
        // MainMenu,
        // MainGame,
        // GameOver
    ]
};

export default new Game(config);