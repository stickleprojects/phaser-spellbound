import { Rectangle } from "../../config/levelconfig";
import { MenuDialog, MenuDialogParameters } from "./MenuDialog";

export class MessageDialogParameters extends MenuDialogParameters {

    centerX: boolean;
    centerY: boolean;

}

export class MessageDialog extends MenuDialog {
    constructor() {
        super('messageDialog');
    }



    protected calculateDimensions(data: MessageDialogParameters): Rectangle {


        let h = this.calcHeightOfMenuItems(data);

        if (data.centerX) {

            let w = this.calcWidthOfMenuItems(data);
            data.dimensions.width = w;

            // screenwidth = 
            let x = (this.sys.game.canvas.width / 2) - (w / 2);


            data.dimensions.x = x;
        }

        if (data.centerY) {
            let y = this.sys.game.canvas.height - (h / 2);
            y = y / 2;

            data.dimensions.y = y;
        }

        return new Rectangle(data.dimensions.x, data.dimensions.y, data.dimensions.width, h);
    }
}