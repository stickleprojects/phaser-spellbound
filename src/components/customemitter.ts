import Phaser from "phaser"

export const GAMEEVENT_SHOWMESSAGE = 'showmessagedialog';
export const GAMEEVENT_MODALDIALOG_SHOW = 'modaldialog_show';
export const GAMEEVENT_MODALDIALOG_CLOSE = 'modaldialog_close';
export const GAMEEVENT_TURN_ON_LIGHT = "turn_on_inventorylight";
export const GAMEEVENT_TURN_OFF_LIGHT = "turn_off_inventorylight";

export const customEmitter: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter()
