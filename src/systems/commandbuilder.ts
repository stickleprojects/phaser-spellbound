
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


import { customEmitter, GiveItemEventArgs } from "../components/customemitter";


//import { IInventoryItem, IInventoryOwner, Inventory } from "../inventory";

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
    execute(): Promise<boolean>;

}
export interface ICommandExecutor {
    PickupItem(itemId: string): Promise<boolean>;
    GiveItem(itemId: string, characterId: string): Promise<boolean>;
}
export interface ICommandPresenter {
    GetInventoryItemId(): Promise<string>;
    GetNearbyCharacterId(): Promise<string>;
}
abstract class CommandBase implements ICommand {
    private _presenter: ICommandPresenter;
    private _executor: ICommandExecutor;

    get Executor(): ICommandExecutor { return this._executor };
    get Presenter(): ICommandPresenter { return this._presenter };

    constructor(commandBuilder: ICommandPresenter, commandServer: ICommandExecutor) {

        this._presenter = commandBuilder;
        this._executor = commandServer;
    }

    abstract execute(): Promise<boolean>;

}
export class PickupCommand extends CommandBase {

    constructor(presenter: ICommandPresenter, server: ICommandExecutor) {
        super(presenter, server)
    }

    execute(): Promise<boolean> {

        return super.Presenter.GetInventoryItemId()
            .then((itemId: string) => {
                console.log(`pickup nearby item ${itemId}`);

                super.Executor.PickupItem(itemId);
                return true;
            }, (err: any) => {
                console.log("something went really wrong", err)
                return false;

            })
            ;


    }

}

export class GiveCommand implements ICommand {
    execute(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
export class CommandExecutor implements ICommandExecutor {
    PickupItem(itemId: string): Promise<boolean> {
        // emit the correct event
        // customEmitter.emit(KEYEVENT_PICKUP_ITEM, { itemid: itemId });
        customEmitter.emitPickupItem(itemId);
        return Promise.resolve(true);
    }
    GiveItem(itemId: string, characterId: string): Promise<boolean> {
        //        customEmitter.emit(KEYEVENT_PICKUP_ITEM, { itemid: itemId, characterId: characterId });
        customEmitter.emitGiveItem(new GiveItemEventArgs(itemId, characterId));
        return Promise.resolve(true);
    }

}


export class CommandBuilder {

    //private _showScene: (sceneargs: ShowSceneArguments) => Promise<ShowSceneArguments>;

    private _commands: ICommand[] = new Array<ICommand>();
    private _presenter: ICommandPresenter;
    private _executor: ICommandExecutor;

    constructor(
        presenter: ICommandPresenter,
        executor: ICommandExecutor
        //    onShowScene: (sceneargs: ShowSceneArguments) => Promise<ShowSceneArguments>
    ) {

        this._presenter = presenter;
        this._executor = executor;

        //  this._showScene = onShowScene;

        this.initCommands();

    }
    PickupItem(): Promise<boolean> {
        const x = new PickupCommand(this._presenter, this._executor);
        return x.execute();
    }
    GiveItem(itemId: string, characterId: string): Promise<boolean> {
        console.log("pickupItem", itemId, characterId);
        throw new Error("Method not implemented.");
    }
    initCommands() {
        this._commands.push(new PickupCommand(this, this));
    }

    public GetInventoryItemId(): Promise<string> {

        return Promise.resolve<string>('fred');
    }
    public GetNearbyCharacterId(): Promise<string> {
        return Promise.resolve<string>('nearbycharacterid');
    }

    public GetAnyCharacterId(): Promise<string> {
        return Promise.resolve<string>('anycharacter');
    }
    public GetNearbyItemId(): Promise<string> {
        return Promise.resolve<string>('nearbyitemid');
    }
    public ExecuteCommand(commandid: string): Promise<boolean> {
        let c = this._commands[0];

        console.log(commandid);

        return c.execute();
    }


}