
import { Door, IDoor, IDoorSprite, LiftManager } from './liftManager';
import { mock } from 'jest-mock-extended';

describe("door test", () => {
    describe('close', () => {
        // it('should play the close animation', async () => {
        //     const spr = mock<IDoorSprite>();
        //     spr.PlayAnimation.mockImplementationOnce((animationName: string) => {
        //         console.log(animationName);
        //         return Promise.resolve();
        //     })

        //     const d = new Door(spr);

        //     await d.CloseAsync();

        //     expect(spr.PlayAnimation).toHaveBeenCalledWith('close');

        // })
        // it('should set closed state after the close animation finishes', async () => {
        //     const spr = mock<IDoorSprite>();
        //     spr.PlayAnimation.mockImplementationOnce((animationName: string) => {
        //         console.log(animationName);

        //         //  spr.OnAnimationCompleted(animationName);
        //         return Promise.resolve();
        //     });

        //     const d = new Door(spr);

        //     await d.CloseAsync();

        //     expect(d.isClosed).toBe(true);

        // })
    })
})
describe("lift manager test", () => {

    it('should close all lift doors', async () => {

        let doors: IDoor[] = [];

        const d = mock<IDoor>();
        doors.push(d);

        await LiftManager.CreateAsync(doors);

        expect(d.CloseAsync).toHaveBeenCalled();

    })

    describe('when opening one door', () => {
        it('should close the other doors', async () => {
            let doors: IDoor[] = [];

            const md1 = mock<IDoor>();
            mock(md1).CloseAsync.mockReturnValue(Promise.resolve(true));

            const md2 = mock<IDoor>();
            mock(md2).CloseAsync.mockReturnValue(Promise.resolve(true));

            const md3 = mock<IDoor>();
            mock(md3).CloseAsync.mockReturnValue(Promise.resolve(true));

            doors.push(md1);
            doors.push(md2);
            doors.push(md3);

            const sut = await LiftManager.CreateAsync(doors);
            await sut.callLiftAsync(2);

            doors.forEach(d => expect(d.CloseAsync).toHaveBeenCalled());
            expect(doors[2].OpenAsync).toHaveBeenCalled();

        })
    })
})