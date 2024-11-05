import Phaser from "phaser"
import { IInventoryItem, InventoryEventArgs } from "../inventory";
import { KEYEVENT_CLOSEDIALOG, KEYEVENT_DROP_ITEM, KEYEVENT_FOLLOW_PLAYER, KEYEVENT_OPENDIALOG, KEYEVENT_PICKUP_ITEM, KEYEVENT_TELEPORT, KEYEVENT_TOGGLE_DEBUG } from "../systems/inputEventSystem";
import { HudFlags, HudRoomInfo } from "../scenes/Hud";
import { SceneWithData } from "../systems/dialogManager";

export const GAMEEVENT_SHOWMESSAGE = 'showmessagedialog';
export const GAMEEVENT_MODALDIALOG_SHOW = 'modaldialog_show';
export const GAMEEVENT_MODALDIALOG_CLOSE = 'modaldialog_close';
export const GAMEEVENT_TURN_ON_LIGHT = "turn_on_inventorylight";
export const GAMEEVENT_TURN_OFF_LIGHT = "turn_off_inventorylight";
export const GAMEEVENT_GIVE_ITEM = "give_item";
export const GAMEEVENT_GOTO_LIFT = "goto_lift";

export type OnEventHandler<TARGS> = (args: TARGS) => void;

export class GiveItemEventArgs {
    itemId: string;
    characterId: string;
    constructor(itemid: string, characterid: string) {
        this.itemId = itemid;
        this.characterId = characterid;
    }
}
export class SpellboundEmitter {

    private _events: Phaser.Events.EventEmitter;

    constructor() {
        this._events = new Phaser.Events.EventEmitter();

    }

    public emitCloseDialog() {
        this._events.emit(KEYEVENT_CLOSEDIALOG);
    }
    public onCloseDialog(eventHandler: OnEventHandler<null>): void {
        this._events.on(KEYEVENT_CLOSEDIALOG, eventHandler);
    }

    public emitItemAdded(args: InventoryEventArgs) {
        this._events.emit("itemadded", args);
    }
    public onItemAdded(eventHandler: OnEventHandler<InventoryEventArgs>): void {
        this._events.on("itemadded", eventHandler);
    }

    public emitItemRemoved(args: InventoryEventArgs) {
        this._events.emit("itemremoved", args);
    }
    public onItemRemoved(eventHandler: OnEventHandler<InventoryEventArgs>): void {
        this._events.on("itemremoved", eventHandler);
    }
    public emitModalDialogClose(args: SceneWithData) {
        this._events.emit(GAMEEVENT_MODALDIALOG_CLOSE, args);
    }
    public onModalDialogClose(eventHandler: OnEventHandler<SceneWithData>): void {
        this._events.on(GAMEEVENT_MODALDIALOG_CLOSE, eventHandler);
    }
    public emitModalDialogShow(args: SceneWithData) {
        this._events.emit(GAMEEVENT_MODALDIALOG_SHOW, args);
    }
    public onModalDialogShow(eventHandler: OnEventHandler<SceneWithData>): void {
        this._events.on(GAMEEVENT_MODALDIALOG_SHOW, eventHandler);
    }

    public emitScreenMove(roomInfo: HudRoomInfo) {
        this._events.emit("screenmov", roomInfo);
    }
    public onScreenMove(eventHandler: OnEventHandler<HudRoomInfo>): void {
        this._events.on("screenmov", eventHandler);
    }
    public emitOpenDialogs(): void {
        this._events.emit(KEYEVENT_OPENDIALOG);
    }
    public onOpenDialog(eventHander: OnEventHandler<null>): void {
        this._events.on(KEYEVENT_OPENDIALOG, eventHander);
    }
    public OnTeleport(eventHander: OnEventHandler<null>): void {
        this._events.on(KEYEVENT_TELEPORT, eventHander);
    }
    public emitTeleport(): void {
        this._events.emit(KEYEVENT_TELEPORT);
    }
    public emitDropItem(id: string): void {
        this._events.emit(KEYEVENT_DROP_ITEM, id);

    }
    public onDropItem(eventHander: OnEventHandler<string>): void {
        this._events.on(KEYEVENT_DROP_ITEM, eventHander);
    }
    public emitPickupItem(itemId: string): void {

        this._events.emit(KEYEVENT_PICKUP_ITEM, itemId);
    }
    public onPickupItem(eventHander: OnEventHandler<string>): void {
        this._events.on(KEYEVENT_PICKUP_ITEM, eventHander);
    }

    public emitGiveItem(args: GiveItemEventArgs) {
        this._events.emit(GAMEEVENT_GIVE_ITEM, args)
    }
    public onGiveItem(eventHander: OnEventHandler<GiveItemEventArgs>): void {
        this._events.on(GAMEEVENT_GIVE_ITEM, eventHander);
    }
    public emitShowMessage(text: string[]) {
        this._events.emit(GAMEEVENT_SHOWMESSAGE, text);
    }
    public onShowMessage(eventHandler: OnEventHandler<string[]>): void {
        this._events.on(GAMEEVENT_SHOWMESSAGE, eventHandler);
    }

    public emitTurnOnLight(item: IInventoryItem) {
        this._events.emit(GAMEEVENT_TURN_ON_LIGHT, item);
    }
    public onTurnOnLight(eventHandler: OnEventHandler<IInventoryItem>): void {
        this._events.on(GAMEEVENT_TURN_ON_LIGHT, eventHandler);

    }
    public emitTurnOffLight(item: IInventoryItem) {
        this._events.emit(GAMEEVENT_TURN_OFF_LIGHT, item);
    }
    public onTurnOffLight(eventHander: OnEventHandler<IInventoryItem>): void {
        this._events.on(GAMEEVENT_TURN_OFF_LIGHT, eventHander);

    }

    public emitToggleDebug() {
        this._events.emit(KEYEVENT_TOGGLE_DEBUG);

    }
    public onToggleDebug(eventHander: OnEventHandler<null>): void {
        this._events.on(KEYEVENT_TOGGLE_DEBUG, eventHander);
    }

    public emitToggleFollowPlayer() {
        this._events.emit(KEYEVENT_FOLLOW_PLAYER);
    }
    public onToggleFollowPlayer(eventHander: OnEventHandler<null>): void {
        this._events.on(KEYEVENT_FOLLOW_PLAYER, eventHander);
    }

    public UpdateFlags(newhudFlags: HudFlags) {
        this._events.emit("updateflags", newhudFlags);
    }
    public onUpdateFlags(eventHander: OnEventHandler<HudFlags>): void {
        this._events.on('updateflags', eventHander);
    }

}

export const customEmitter: SpellboundEmitter = new SpellboundEmitter();

