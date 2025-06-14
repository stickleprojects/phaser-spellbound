import { Scene } from "phaser";
import { HudParameters } from "./Hud";
import { GamePlayWindowConfig } from "./GamePlay";
import { CopyrightPanelParameters } from "./CopyrightPanel";
import { BottomPanelParameters } from "./BottomPanel";

import { DialogManager, ISceneManager } from "../systems/dialogManager";
import { customEmitter } from "../components/customemitter";

export class MainWindow extends Scene implements ISceneManager {
  private _hudHeight = 60;
  private _copyrightHeight = 120;
  private _dialogManager: DialogManager;

  constructor() {
    super("MainWindow");
  }
  start(key: string, data: any): void {
    this.scene.launch(key, data);
  }
  stop(key: string | Scene): void {
    this.scene.stop(key);
  }
  getScene(key: string): Phaser.Scene {
    return this.scene.get(key);
  }
  bringToTop(key: string): void {
    this.scene.bringToTop(key);
  }

  getInput(): Phaser.Input.InputPlugin {
    return this.input;
  }

  update(time: number, delta: number) {
    this._dialogManager.update(time, delta);
  }

  showHud() {
    var hudData = new HudParameters(
      this,
      0,
      0,
      this.sys.game.canvas.width,
      this._hudHeight
    );

    this.scene.launch("hud", hudData);
  }

  getHudScene(): Scene {
    return this.scene.manager.getScene("hud")!;
  }
  getInventoryScene(): Scene {
    return this.scene.manager.getScene("inventory")!;
  }

  getGameplayScene(): Scene {
    return this.scene.manager.getScene("GamePlay")!;
  }
  getCopyrightScene(): Scene {
    return this.scene.manager.getScene("copyright")!;
  }

  private closeLastDialog() {
    this._dialogManager.closeTopmost();
  }
  wireUpEvents() {
    customEmitter.onModalDialogClose((data) => {
      if (!this._dialogManager.isModalOpen()) {
        const s = this.getGameplayScene();
        s.scene.setActive(true);
      }
    });

    customEmitter.onCloseDialog((id: string) => {
      if (id) {
        if (DEBUG_LEVEL > 0) console.log("Should be closing dialog", id);
        this._dialogManager.closeDialog(id);
      } else {
        this.closeLastDialog();
      }
    });
    customEmitter.onModalDialogShow((data) => {
      const s = this.getGameplayScene();
      s.scene.setActive(false);
    });
  }
  showCopyrightPanel() {
    const height = this._copyrightHeight;
    var copyrightData = new CopyrightPanelParameters(
      this,
      0,
      this.sys.game.canvas.height - height,
      this.sys.game.canvas.width - 120,
      height
    );

    this.scene.launch("copyright", copyrightData);
  }
  showInventoryPanel() {
    const height = this._copyrightHeight;
    var data = new BottomPanelParameters(
      this,
      0,
      this.sys.game.canvas.height - height,
      this.sys.game.canvas.width - 120,
      height
    );

    this.scene.launch("inventory", data);
  }
  showGamePlayWindow() {
    var top = this._hudHeight;
    var height =
      this.sys.game.canvas.height - this._hudHeight - this._copyrightHeight;

    if (!this._dialogManager) {
      throw "Dialogmanager not set";
    }
    var playWindow = new GamePlayWindowConfig(
      this,
      0,
      top,
      this.sys.game.canvas.width,
      height,
      this._dialogManager
    );

    this.scene.launch("GamePlay", playWindow);
  }

  init() {
    // everything is loaded, so display stuff
    // data is the params passed to this scene with this.scene.start(key,data)

    this._dialogManager = new DialogManager(this);

    this.showHud();

    this.showCopyrightPanel();

    this.showInventoryPanel();

    this.showGamePlayWindow();

    this.wireUpEvents();
  }
  create() {}
}
