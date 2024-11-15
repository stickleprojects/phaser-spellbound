import { mock } from 'jest-mock-extended'
import { ICommandPresenter, ICommandExecutor, PickupCommand, CommandBuilder } from './commandbuilder';

describe('pickup command tests', () => {
    it("should return invoke commandbuilder", async () => {
        const cb = mock<ICommandPresenter>();
        const cs = mock<ICommandExecutor>();

        const itemid = "fred";
        cb.GetInventoryItemId.mockReturnValue(Promise.resolve<string>(itemid));

        let pp = new PickupCommand(cb, cs);
        pp.execute().then((result: Boolean) => {
            expect(cb.GetInventoryItemId).toHaveBeenCalled();
            expect(cs.PickupItem).toHaveBeenCalledWith(itemid);
            expect(result).toBe(true);

        })
    })
    it("should return invoke commandexecutor", async () => {
        const cb = mock<ICommandPresenter>();
        const cs = mock<ICommandExecutor>();

        const itemid = "fred";
        cb.GetInventoryItemId.mockReturnValue(Promise.resolve<string>(itemid));

        let pp = new PickupCommand(cb, cs);
        pp.execute().then((result: Boolean) => {
            expect(cb.GetInventoryItemId).toHaveBeenCalled();
            expect(cs.PickupItem).toHaveBeenCalledWith(itemid);
            expect(result).toBe(true);
        })
    })
})
describe('commandbuilder tests', () => {

    it('should pause the main screen', async () => {
        const cp = mock<ICommandPresenter>();
        const cs = mock<ICommandExecutor>();

        let cb = new CommandBuilder(cp, cs);

        // cb is a statemachine
        return cb.GetInventoryItemId()
            .then((itemId: string) => {
                expect(itemId).toBe('fred');

            });


    });
    it('should present a list of commands in a popup', () => { });
    it('should display the verb of the command in the builder screen and prompt for the subject', () => {
        // TAKE [from florin] [the saxophone] is rewritten as Take the saxophone from florin
        // GIVE [from inventory] to [select person in room]
        // command [any character you have met] to [do something]

    });
    it('should display the noun selector for the command', () => { });

    describe('TAKE Command', () => {
        //let sut: CommandBuilder;
        //const expectedTemplateText = 'TAKE [something] from [someone]';

        beforeEach(() => {


        })

        it('should show the template in the scene', () => {
            /*
                        expect(sut.CommandText).toBe(expectedTemplateText);
            */
        })
        it('should present the list of people in the room', () => {

        });
        describe('once you selected a person', () => {
            it('should update the template with the person selected', () => {
                //const personName = 'florin the dwarf'
                //             const expectedText = expectedTemplateText.replace('[someone]', personName);
                /*
                                expect(sut.CommandText.toString()).toBe(expectedText);
                 */
            });
            it('should present the list of items in that persons inventory', () => { });

            describe('once you select an item', () => {
                it('should update the template with the person and item', () => { });
                it('should emit the take event', () => { })
            })
        })

    })
    describe("DROP command", () => {
        it('should do a thing', () => {

        });
    });
});