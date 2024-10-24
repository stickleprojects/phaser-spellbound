import { Scene } from "phaser";
import { Rectangle } from "../../config/levelconfig";
import { Dialog, DialogParameters } from "./Dialog";

export class MenuDialogParameters extends DialogParameters {
    menuitems: string[]
    autosize: boolean = true

    constructor(parent: Scene, dims: Rectangle, menuitems: string[], autosize: boolean = true, promise?: Promise<string>) {
        super(parent, dims, promise)

        this.menuitems = menuitems;
        this.autosize = autosize;
    }
}
export class MenuDialog extends Dialog {
    private _menuItems: Phaser.GameObjects.Text[];

    private _itemGapTop: number = 10;
    private _itemHeight: number = 20;
    private _itemGapBetween: number = 1;
    private _itemGapLeft: number = 10;

    constructor(id: string = 'menudialog1') {
        super(id)
    }

    protected calculateDimensions(data: MenuDialogParameters): Rectangle {


        let h = this.calcHeightOfMenuItems(data);

        return new Rectangle(data.dimensions.x, data.dimensions.y, data.dimensions.width, h);
    }

    init(data: MenuDialogParameters) {

        let newData = data;
        if (data.autosize) {
            // resize the dims
            let newDimensions = this.calculateDimensions(data);
            newData = Object.assign({}, data, { dimensions: newDimensions });
        }
        super.init(newData);

    }

    calcHeightOfMenuItems(data: MenuDialogParameters): number {
        console.log(data);

        const borderHeight = data.tileHeight * 2
        const itemCount = data.menuitems.length;
        return borderHeight + this._itemGapTop + (itemCount * this._itemHeight) + ((itemCount - 1) * this._itemGapBetween);
    }


    addControls(data: MenuDialogParameters, innerRect: Rectangle) {

        console.log(data);

        const itemHeight = this._itemHeight;
        let y = innerRect.y + this._itemGapTop;
        let x = innerRect.x + this._itemGapLeft;
        this._menuItems = data.menuitems.map((id) => {

            const item = this.createMenuItem(id, x, y);
            y += itemHeight;
            return item;

        });
    }
    createMenuItem(itemdata: string, x: number, y: number): Phaser.GameObjects.Text {

        const c = Phaser.Display.Color.RGBToString(this._color.red, this._color.green, this._color.blue);

        const item = this.add.text(x, y, itemdata, { color: c });

        return item;
    }
}