import { MenuDialog, MenuDialogParameters } from "./MenuDialog";

export class CommandItem {
    private _name: string;
    onExecute: (args: CommandDialogParameters) => void;

    constructor(name: string, onexecute: (p: CommandDialogParameters) => void) {
        this._name = name;
        this.onExecute = onexecute;
    }


    toString(): string {
        return this._name;
    }
}
export class CommandDialogParameters extends MenuDialogParameters {

    isModal: boolean = true;

    constructor(parent: Scene, dims: Rectangle, menuitems: CommandItem[], autosize: boolean = true, promise?: Promise<string>) {
        super(parent, dims, menuitems, autosize, promise);


        this.allowSelection = true;
    }
}
export class CommandDialog extends MenuDialog {

    constructor(id: string | undefined) {
        super(id ?? 'commandDialog');

    }

    override init(data: CommandDialogParameters): void {
        super.init(data);
    }

    protected override ActionCurrentItem(): void {
        const selectedItem = this._data.menuitems[this.SelectedItemIndex] as CommandItem;
        if (!selectedItem) return;

        if (selectedItem) {
            if (selectedItem.onExecute) {
                selectedItem.onExecute(this._data);

            }
        }
    }
}