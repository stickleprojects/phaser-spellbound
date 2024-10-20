
// swap to behaviourtree, since how you get to a state is important and we want to share tasks
// https://github.com/nikkorn/mistreevous
/*
commandbuilder is a state machine
start -> commandlist
commandlist -> [some commands]
enum CommandStates {
    Commandlist,
    Pickup,
    Drop,
    InventoryList,
    NearbyItemList,
    NearbyCharacterList,
    CharacterInventoryList,
    GlobalCharacterList,
    Execute,
    Abandon

}
    */

export class ShowSceneArguments {
    sceneKey: string;
    characterId?: string;
    itemId?: string;

    constructor(scenekey: string, characiterid?: string, itemid?: string) {
        this.sceneKey = scenekey;
        this.characterId = characiterid;
        this.itemId = itemid;
    }
}
interface ICommand {
    execute(): Promise<ShowSceneArguments>;

}
class PickupCommand implements ICommand {
    private _showScene: (sceneargs: ShowSceneArguments) => Promise<ShowSceneArguments>;


    constructor(fnShowScene: (sceneargs: ShowSceneArguments) => Promise<ShowSceneArguments>) {

        // we need to show a list of nearby items and wait for one to be chosen
        // showng the list is async, so show it and wait for inventoryitemchoen event

        this._showScene = fnShowScene


    }


    execute(): Promise<any> {

        return this._showScene(new ShowSceneArguments('nearbyitemslist'))
            .then((data: ShowSceneArguments) => {

                // eecute the command;
                console.log("'user chose something!", data);

                return data;
            },
                (err) => {
                    this._showScene(new ShowSceneArguments('abandoned' + err));
                }
            );
    }

}
export class CommandBuilder {

    private _showScene: (sceneargs: ShowSceneArguments) => Promise<ShowSceneArguments>;

    private _commands: ICommand[] = new Array<ICommand>();

    constructor(onShowScene: (sceneargs: ShowSceneArguments) => Promise<ShowSceneArguments>) {


        this._showScene = onShowScene;

        this.initCommands();

    }
    initCommands() {
        this._commands.push(new PickupCommand(this.onCommandShowScene.bind(this)));
    }

    public ExecuteCommand(commandid: string): Promise<ShowSceneArguments> {
        let c = this._commands[0];

        console.log(commandid);

        return c.execute();
    }
    private onCommandShowScene(args: ShowSceneArguments): Promise<ShowSceneArguments> {


        return this._showScene(args);

    }



}