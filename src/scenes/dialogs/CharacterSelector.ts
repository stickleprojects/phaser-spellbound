import { CommandDialog, CommandDialogParameters, CommandItem } from "./CommandDialog";

export class CharacterDialogParameters extends CommandDialogParameters {

    constructor(parent: Scene, dims: Rectangle, menuitems: CommandItem[], autosize: boolean = true, promise?: Promise<string>) {
        super(parent, dims, menuitems, autosize, promise);


        this.allowSelection = true;
    }
}
export class CharacterDialog extends CommandDialog {

    constructor() {
        super('characterDialog');
    }


}