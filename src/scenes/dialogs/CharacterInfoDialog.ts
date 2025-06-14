import { Scene } from "phaser";
import { Rectangle } from "../../config/levelconfig";
import { ObjectItem } from "../objectitem";
import { Dialog, DialogParameters } from "./Dialog";
import { CharacterSprite } from "../GamePlay";
import { getMetadata } from "reflect-metadata/no-conflict";
import { GetStats, PropertyStats } from "../../config/decorators";

export class CharacterInfoParameters extends DialogParameters {
  isModal: boolean = true;
  CharacterInfo: CharacterSprite;

  constructor(parent: Scene, dims: Rectangle, CharacterInfo: CharacterSprite) {
    super(parent, dims);
    this.color = "0xfd0606";

    this.CharacterInfo = CharacterInfo;
  }
}
export class CharacterInfoDialog extends Dialog {
  icon: Phaser.GameObjects.Image;
  title: Phaser.GameObjects.Text;

  constructor(id: string | undefined) {
    super(id ?? "characterInfoDialog");
  }

  override init(data: CharacterInfoParameters): void {
    super.init(data);
  }

  override destroyControls() {
    this.icon?.destroy();
    this.title?.destroy();
  }
  override addControls(
    data: CharacterInfoParameters,
    innerRect: Rectangle
  ): void {
    let x: number = innerRect.x;
    let y: number = innerRect.y;

    const w = 60;
    const h = w * 2;
    const r = this.add.rectangle(x, y, w, h);
    r.setStrokeStyle(1, 0xffff);
    r.setOrigin(0, 0);

    const iconRect = new Rectangle(r.x + 30, r.y + 60, 60, 120);

    this.icon = this.add.image(
      iconRect.x,
      iconRect.y,
      data.CharacterInfo.texture,
      data.CharacterInfo.frame.name
    );

    this.icon.setScale(3);

    const left = x + 70;
    this.title = this.add.text(left, y, data.CharacterInfo.name, {
      align: "center",
      fixedWidth: innerRect.width - left,
    });

    const inf = data.CharacterInfo.Info;
    const statstuff = GetStats(inf.stats!);
    if (DEBUG_LEVEL > 0) console.log(statstuff);

    const vy: number = 15;
    let start: number = y + 40;
    // add the stats

    statstuff?.forEach((value: PropertyStats, key: string) => {
      if (value) {
        this.add.text(left, start, `${value.description} = ${value.getter()}`);
        start += vy;
      }
    });
  }
}
