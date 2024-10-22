import { mock } from 'jest-mock-extended';
import { IInventoryItem, Inventory, InventoryEmptyError, ItemAlreadyInInventoryError, ItemNotInInventoryError, ItemTooHeavyError, TooManyItemsError } from './inventory'

describe("Inventory Test Suite", () => {

    //let ownerMock: IInventoryOwner;
    let eventEmitter: Phaser.Events.EventEmitter;
    let maxNumberOfItems: number = 15;
    let maxTotalWeight: number = 10.5;
    beforeEach(() => {
        //ownerMock = mock<IInventoryOwner>();

        eventEmitter = mock<Phaser.Events.EventEmitter>();
        maxNumberOfItems = 15;
        maxTotalWeight = 10.4;
    });

    function createSUT() {
        return new Inventory(maxNumberOfItems, maxTotalWeight, eventEmitter);
    }
    describe("AddItem tests", () => {
        it("should notify on item added", async () => {
            let i = createSUT();

            let item = mock<IInventoryItem>();
            item.id = "testitem";
            item.weight = 1;
            expect(i.AddItem(item).ok).toBe(true);

            expect(eventEmitter.emit).toHaveBeenCalledWith("itemadded", expect.anything());
        })
        it("should error if too many items", async () => {

            maxNumberOfItems = 1;
            let i = createSUT();

            let item = mock<IInventoryItem>();
            item.id = "testitem";
            item.weight = 1;
            expect(i.AddItem(item).ok).toBe(true);

            let item2 = mock<IInventoryItem>();
            item2.id = "testitem2";
            item2.weight = 1;

            let result = i.AddItem(item2);
            expect(result).toMatchObject({ ok: false, error: expect.any(TooManyItemsError) });

        })
        it("should error if item too heavy", async () => {

            let i = createSUT();

            let item = mock<IInventoryItem>();
            item.id = "testitem";
            item.weight = maxTotalWeight + 10;


            const result = i.AddItem(item)
            expect(result).toMatchObject({ ok: false, error: expect.any(ItemTooHeavyError) });

        })
        it("should error if item already in inventory", async () => {

            let i = createSUT();

            let item = mock<IInventoryItem>();
            item.id = "testitem";
            item.weight = 1;

            expect(i.AddItem(item).ok).toBe(true);
            const result = i.AddItem(item);
            expect(result).toMatchObject({ ok: false, error: expect.any(ItemAlreadyInInventoryError) });

        })
        it("should add item", async () => {

            let i = createSUT();

            let item = mock<IInventoryItem>();
            item.id = "testitem";
            item.weight = maxTotalWeight - 1;

            const result = i.AddItem(item)
            expect(result.ok).toBe(true);

            expect(i.GetItems()).toContain(item);

        })
        it("should add a few items if not too much total weight", async () => {

            let i = createSUT();

            let item = mock<IInventoryItem>();
            item.id = "testitem";
            item.weight = 1;

            let result = i.AddItem(item)
            expect(result.ok).toBe(true);

            let item2 = mock<IInventoryItem>();
            item2.id = "testitem2";
            item2.weight = 1;

            result = i.AddItem(item2)
            expect(result).toMatchObject({ ok: true, value: true });

            expect(i.GetItems()).toContain(item);
            expect(i.GetItems()).toContain(item2);

        })
    })
    describe("RemoveItem tests", () => {
        it("should notify on item removed", async () => {
            let i = createSUT();

            let item = mock<IInventoryItem>();
            item.id = "testitem";
            item.weight = 1;
            expect(i.AddItem(item).ok).toBe(true);
            const result = i.RemoveItem(item)
            expect(result.ok).toBe(true);

            expect(eventEmitter.emit).toHaveBeenCalledWith("itemremoved", expect.anything());
        })
        it("should error if inventory is empty", async () => {

            let i = createSUT();
            let item = mock<IInventoryItem>();
            item.id = "testitem";

            const result = i.RemoveItem(item)
            expect(result).toMatchObject({ ok: false, error: expect.any(InventoryEmptyError) });


        })
        it("should error if item not in inventory", async () => {

            let i = createSUT();

            let item = mock<IInventoryItem>();
            item.id = "testitem";
            expect(i.AddItem(item).ok).toBe(true);

            let item2 = mock<IInventoryItem>();
            item2.id = "testitem2";
            const result = i.RemoveItem(item2)

            expect(result).toMatchObject({ ok: false, error: expect.any(ItemNotInInventoryError) });

        })
        it("should remove item", async () => {

            let i = createSUT();

            let item = mock<IInventoryItem>();
            item.id = "testitem";
            expect(i.AddItem(item).ok).toBe(true);

            const result = i.RemoveItem(item)
            expect(result).toMatchObject({ ok: true, value: true });

            expect(i.GetItems()).not.toContain(item);

        })

    })
});
