import { Scene } from "phaser";
import { Rectangle } from "../../config/levelconfig";
import { Dialog, DialogParameters } from "./Dialog";

export class MenuDialogParameters extends DialogParameters {
    menuitems: string[]
    autosize: boolean = true

    allowSelection: boolean = false

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

    private _selectedItemIndex = 0;
    private _selectionIndicator: Phaser.GameObjects.Rectangle;


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

    protected calcWidthOfMenuItems(data: MenuDialogParameters): number {

        const maxChars = data.menuitems.reduce((a: number, b: string) => b.length > a ? b.length : a, 0);

        const charWidth = 10;
        const borderWidth = data.tileWidth * 2;
        return borderWidth + (maxChars * charWidth);


    }
    protected calcHeightOfMenuItems(data: MenuDialogParameters): number {

        const borderHeight = data.tileHeight * 2
        const itemCount = data.menuitems.length;
        return borderHeight + this._itemGapTop + (itemCount * this._itemHeight) + ((itemCount - 1) * this._itemGapBetween);
    }

    private deselectAllItems() {
        this._menuItems.forEach(t => {
            t.setBackgroundColor('#0');
        })
    }

    private selectFirstMenuItem() {
        if (!this._selectionIndicator) return;

        let idx = this._menuItems.findIndex(x => x.text.length > 0);
        this.SelectedItemIndex = idx;

    }
    private selectItem(idx: number) {
        const safeIdx = Phaser.Math.Clamp(idx, 0, this._menuItems.length - 1)
        if (!this._selectionIndicator) return;


        //this._menuItems[this._selectedItemIndex].setBackgroundColor('#202020');
        let s = this._menuItems[safeIdx];

        if (!s) {
            console.log('cannot selectitem', idx, ' menuitems entry was null');
            return;
        }
        this._selectionIndicator.setPosition(0, s.y);
    }
    set SelectedItemIndex(value: number) {
        if (value >= this._menuItems.length) value = this._menuItems.length;

        if (value != this._selectedItemIndex) {
            this.deselectAllItems()
        }
        this._selectedItemIndex = value;
        this.selectItem(this._selectedItemIndex)
    }
    get SelectedItemIndex() {
        return this._selectedItemIndex;
    }


    addControls(data: MenuDialogParameters, innerRect: Rectangle) {


        const itemHeight = this._itemHeight;
        let y = innerRect.y + this._itemGapTop;
        let x = innerRect.x + this._itemGapLeft;
        this._menuItems = data.menuitems.map((id) => {

            const item = this.createMenuItem(id, x, y);
            y += itemHeight;
            return item;

        });

        this.SelectedItemIndex = 0;

        if (data.allowSelection) {
            this._selectionIndicator = this.add.rectangle(0, 0, innerRect.width, itemHeight);
            this._selectionIndicator.setOrigin(0, 0);
            this._selectionIndicator.setStrokeStyle(2, Phaser.Display.Color.GetColor(200, 200, 200))
            this._selectionIndicator.setAlpha(0.5);
        }
        this.selectFirstMenuItem();
    }
    createMenuItem(itemdata: string, x: number, y: number): Phaser.GameObjects.Text {

        const c = this._borderTint.replace('0x', '#');

        const item = this.add.text(x, y, itemdata, { color: c });

        return item;
    }

    override update(time: number, delta: number): void {
        super.update(time, delta);


    }
}