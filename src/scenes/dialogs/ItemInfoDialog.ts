import { ItemStats } from "../../config/configentities";
import { Rectangle } from "../../config/levelconfig";
import { ObjectItem } from "../objectitem";
import { Dialog, DialogParameters } from "./Dialog";

export class ItemInfoParameters extends DialogParameters {

    isModal: boolean = true;
    itemInfo: ObjectItem;

    constructor(parent: Scene, dims: Rectangle, itemInfo: ObjectItem) {
        super(parent, dims);

        this.itemInfo = itemInfo;
    }
}
export class ItemInfoDialog extends Dialog {
    icon: Phaser.GameObjects.Image;
    title: Phaser.GameObjects.Text;

    constructor(id: string | undefined) {
        super(id ?? 'itemInfoDialog');

    }

    override init(data: ItemInfoParameters): void {
        super.init(data);
    }

    override destroyControls() {
        this.icon?.destroy();
        this.title?.destroy();
    }
    override addControls(data: ItemInfoParameters, innerRect: Rectangle): void {

        let x: number = innerRect.x;
        let y: number = innerRect.y;

        data.itemInfo

        const w = 60;
        const h = w;
        const r = this.add.rectangle(x, y, w, h);
        r.setStrokeStyle(1, 0xffff);
        r.setOrigin(0, 0);

        this.icon = this.add.image(r.x + 30, r.y + 20, data.itemInfo.Sprite.texture, data.itemInfo.Sprite.frame.name);
        //this.icon.setOrigin(0, 0);
        this.icon.setScale(3);

        const left = x + 70;
        this.title = this.add.text(left, y, data.itemInfo.name,
            { align: 'center', fixedWidth: innerRect.width - left });

        const vy: number = 15;
        let start: number = y + 40;
        // add the stats

        Object.entries(data.itemInfo.stats!).forEach(([key, value]) => {
            if (value) {
                this.add.text(left, start, `${key} = ${value}`);
                start += vy;
            }
        })

    }
}