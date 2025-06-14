import { Scene } from "phaser";
import { Dialog, DialogParameters } from "../scenes/dialogs/Dialog";
import { Stack } from "./stack";
import { customEmitter } from "../components/customemitter";
import { MenuDialog } from "../scenes/dialogs/MenuDialog";
import { InventoryDialogParameters } from "../scenes/dialogs/InventorySelector";
import { Inventory } from "../inventory";

export class DialogResult {
  private _value: any;
  private _inner: DialogResult;

  constructor(value: any, inner: DialogResult) {
    this._value = value;
    this._inner = inner;
  }
}
export class SceneWithData {
  scene: Phaser.Scene;
  data: DialogParameters;

  constructor(scene: Phaser.Scene, data: DialogParameters) {
    this.scene = scene;
    this.data = data;
  }

  update(time: number, delta: number) {
    this.scene.update(time, delta);
  }
}
export interface ISceneManager {
  start(key: string, data: any): void;
  stop(key: string | Scene): void;
  getScene(key: string): Phaser.Scene;
  bringToTop(key: string): void;
  getInput(): Phaser.Input.InputPlugin;
}

export class DialogManager {
  private _sceneManager: ISceneManager;
  private _dialogQueue: Stack<SceneWithData>;

  CloseDialogKey: Phaser.Input.Keyboard.Key | undefined;
  SelectPreviousItem: Phaser.Input.Keyboard.ke | undefined;
  SelectNextItem: Phaser.Input.Keyboard.ke | undefined;
  ActionCurrentItemKey: Phaser.Input.Keyboard.Key | undefined;

  constructor(sceneManager: ISceneManager) {
    this._sceneManager = sceneManager;

    this._dialogQueue = new Stack<SceneWithData>();
  }

  closeDialog(id: string) {
    let d = this._dialogQueue.find((x) => x.scene._id == id);

    if (d) {
      this.closeScene(d);
    }
  }

  actionCurrentItem() {
    this.doCommandOnCurrentDialogScene((tgt: MenuDialog) =>
      tgt.ActionCurrentItem()
    );
  }

  doCommandOnCurrentDialogScene(cmd: (tgt: MenuDialog) => void) {
    if (this._dialogQueue.isEmpty()) return;

    let d: SceneWithData | undefined = this._dialogQueue.peek();
    if (d) {
      let xx = d.scene as MenuDialog;

      if (xx) {
        cmd(xx);
      }
    }
  }
  selectNextItem() {
    this.doCommandOnCurrentDialogScene((tgt) => tgt.SelectedItemIndex++);
  }
  selectPreviousItem() {
    this.doCommandOnCurrentDialogScene((tgt) => tgt.SelectedItemIndex--);
  }

  getTopmost() {
    if (this._dialogQueue.isEmpty()) return;

    let d: SceneWithData | undefined = this._dialogQueue.peek();

    return d;
  }
  closeTopmost() {
    if (this._dialogQueue.isEmpty()) return;

    let d: SceneWithData | undefined = this._dialogQueue.peek();
    if (d) {
      this.closeScene(d);
    }
  }

  isModalOpen(): boolean {
    return this._dialogQueue.any((x) => x.data.isModal);
  }
  closeScene(s: SceneWithData) {
    if (DEBUG_LEVEL > 0) console.log("shutting dialog ", s.scene);
    this._sceneManager.stop(s.scene);

    this._dialogQueue.remove((x) => x.scene._id == s.scene._id);

    if (s?.data.isModal) {
      this.notifyModalClosed(s);
    }

    this.activateTopmostModal();
  }
  clear() {
    while (!this._dialogQueue.isEmpty()) {
      let d = this._dialogQueue.peek();
      if (d) {
        this.closeScene(d);
      }
    }
  }
  notifyModalShow(d: SceneWithData) {
    customEmitter.emitModalDialogShow(d);
  }
  notifyModalClosed(d: SceneWithData) {
    customEmitter.emitModalDialogClose(d);
  }
  deactivateTopmostModal() {
    const m = this._dialogQueue.findLast((x) => x.data.isModal);
    if (m) {
      m.scene.scene.setActive(false);
    }
  }
  activateTopmostModal() {
    const m = this._dialogQueue.findLast((x) => x.data.isModal);
    if (m) {
      m.scene.scene.setActive(true);
    }
  }

  showDialog<T extends Dialog>(
    id: string,
    dparams: DialogParameters
  ): T | undefined {
    let existingScene = this._sceneManager.getScene(id);
    if (existingScene) {
      this._sceneManager.bringToTop(id);
    }

    this._sceneManager.start(id, dparams);

    this._sceneManager.bringToTop(id);

    this.wireupKeyboard();

    this.CloseDialogKey!.isDown = false;
    this.ActionCurrentItemKey!.isDown = false;

    existingScene = this._sceneManager.getScene(id);
    if (existingScene) {
      if (DEBUG_LEVEL > 0) console.log("push scene ", existingScene);

      const s = new SceneWithData(existingScene, dparams);

      if (s.data.isModal) {
        //deactiavte the topmost modal
        this.deactivateTopmostModal();
      }
      this._dialogQueue.push(s);

      if (s.data.isModal) {
        this.notifyModalShow(s);
      }
      return existingScene as T;
    }

    return undefined;
  }

  private wireupKeyboard() {
    if (!this.CloseDialogKey)
      this.CloseDialogKey = this._sceneManager
        .getInput()
        .keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    if (!this.SelectPreviousItem)
      this.SelectPreviousItem = this._sceneManager
        .getInput()
        .keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    if (!this.ActionCurrentItemKey)
      this.ActionCurrentItemKey = this._sceneManager
        .getInput()
        .keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    if (!this.SelectNextItem)
      this.SelectNextItem = this._sceneManager
        .getInput()
        .keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
  }

  update(time: number, delta: number) {
    if (this._dialogQueue.isEmpty()) return;

    let d: SceneWithData | undefined = this._dialogQueue.peek();

    if (!d?.scene.scene.isActive) return;

    if (d) {
      d.update(time, delta);
    }

    if (Phaser.Input.Keyboard.JustDown(this.CloseDialogKey!)) {
      this._sceneManager.getInput().keyboard?.resetKeys();

      this.closeTopmost();
    } else if (Phaser.Input.Keyboard.JustDown(this.SelectPreviousItem!)) {
      this.selectPreviousItem();
    } else if (Phaser.Input.Keyboard.JustDown(this.ActionCurrentItemKey!)) {
      this._sceneManager.getInput().keyboard?.resetKeys();

      this.actionCurrentItem();
    } else if (Phaser.Input.Keyboard.JustDown(this.SelectNextItem!)) {
      this.selectNextItem();
    }
  }
}
