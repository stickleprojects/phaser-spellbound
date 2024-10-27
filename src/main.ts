import { Boot } from './scenes/Boot';
import { CopyrightPanel } from './scenes/CopyrightPanel';
import { CommandDialog } from './scenes/dialogs/CommandDialog';
import { InventoryDialog } from './scenes/dialogs/InventorySelector';

import { MenuDialog } from './scenes/dialogs/MenuDialog';
import { MessageDialog } from './scenes/dialogs/MessageDialog';
// import { Game as MainGame } from './scenes/Game';
// import { GameOver } from './scenes/GameOver';
import { GamePlay } from './scenes/GamePlay';
import { Hud } from './scenes/Hud';
import { InventoryPanel } from './scenes/InventoryPanel';
import { MainWindow } from './scenes/MainWindow';
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
            gravity: { y: 9.8 },
            debug: true
        }
    },
    scene: [

        Boot,
        Preloader,
        GamePlay,
        Hud,
        MainWindow,
        CopyrightPanel,
        InventoryPanel,
        MenuDialog,
        CommandDialog,
        InventoryDialog,
        MessageDialog

        // MainMenu,
        // MainGame,
        // GameOver
    ],

};

export default new Game(config);
