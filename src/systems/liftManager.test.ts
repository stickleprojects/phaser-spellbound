import { IDoor, LiftManager } from './liftManager';
import { mock } from 'jest-mock-extended';

describe("lift manager test", () => {

    it('should start with all lift doors closed', () => {

        let doors: IDoor[] = [];

        const d = mock<IDoor>();
        doors.push(d);

        new LiftManager(doors);

        expect(d.Close).toHaveBeenCalled();

    })

    describe('when opening one door', () => {
        it('should close the other doors', () => {
            let doors: IDoor[] = [];

            const md1 = mock<IDoor>();
            const md2 = mock<IDoor>();
            const md3 = mock<IDoor>();
            doors.push(md1);
            doors.push(md2);
            doors.push(md3);

            const sut = new LiftManager(doors);
            sut.callLift(2);

            expect(md1.Close).toHaveBeenCalled();
            expect(md2.Open).toHaveBeenCalled();
            expect(md3.Close).toHaveBeenCalled();

        })
    })
})