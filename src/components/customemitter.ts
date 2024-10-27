import Phaser from "phaser"

export const GAMEEVENT_SHOWMESSAGE = 'showmessagedialog';
export const GAMEEVENT_MODALDIALOG_SHOW = 'modaldialog_show';
export const GAMEEVENT_MODALDIALOG_CLOSE = 'modaldialog_close';

export const customEmitter: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter()
