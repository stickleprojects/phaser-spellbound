class CommandBase {

}
class GiveCommand extends CommandBase {

    // GIVE something
    constructor() {



    }

    getNextCommand() {

        if (this.object == null) {
            return new InventorySelectCommand((selectedItem) => {
                this.object = selectedItem;
            });
        }
        if (this.tar)
    }
    toString() {
        return "GIVE"
    }
}

class InventorySelectCommand extends CommandBase {

    constructor(parent) {
        this.parent = parent;
    }
}