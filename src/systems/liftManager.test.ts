import { IDoor, LiftManager } from "./liftManager";
import { any, mock } from "jest-mock-extended";

describe("door test", () => {
  describe("close", () => {
    // it('should play the close animation', async () => {
    //     const spr = mock<IDoorSprite>();
    //     spr.PlayAnimation.mockImplementationOnce((animationName: string) => {
    //         if (DEBUG_MODE) console.log(animationName);
    //         return Promise.resolve();
    //     })
    //     const d = new Door(spr);
    //     await d.CloseAsync();
    //     expect(spr.PlayAnimation).toHaveBeenCalledWith('close');
    // })
    // it('should set closed state after the close animation finishes', async () => {
    //     const spr = mock<IDoorSprite>();
    //     spr.PlayAnimation.mockImplementationOnce((animationName: string) => {
    //         if (DEBUG_MODE) console.log(animationName);
    //         //  spr.OnAnimationCompleted(animationName);
    //         return Promise.resolve();
    //     });
    //     const d = new Door(spr);
    //     await d.CloseAsync();
    //     expect(d.isClosed).toBe(true);
    // })
  });
});
describe("lift manager test", () => {
  it("should close all lift doors", async () => {
    let doors: IDoor[] = [];

    const d = mock<IDoor>({ Name: "door1" });
    doors.push(d);

    const im = mock<Phaser.Input.InputPlugin>();
    const kb = mock<Phaser.Input.Keyboard.KeyboardPlugin>();
    kb.addKey
      .calledWith(any())
      .mockReturnValue(mock<Phaser.Input.Keyboard.Key>());
    im.keyboard = kb;
    const s = mock<Phaser.Sound.WebAudioSoundManager>();
    await LiftManager.CreateAsync(doors, im, s);

    expect(d.CloseAsync).toHaveBeenCalled();
  });

  describe("when opening one door", () => {
    it("should close the other doors", async () => {
      let doors: IDoor[] = [];

      const md1 = mock<IDoor>({ Name: "door1" });
      mock(md1).CloseAsync.mockReturnValue(Promise.resolve(true));

      const md2 = mock<IDoor>({ Name: "door2" });
      mock(md2).CloseAsync.mockReturnValue(Promise.resolve(true));

      const md3 = mock<IDoor>({ Name: "door3" });
      mock(md3).CloseAsync.mockReturnValue(Promise.resolve(true));

      doors.push(md1);
      doors.push(md2);
      doors.push(md3);

      const im = mock<Phaser.Input.InputPlugin>();
      const kb = mock<Phaser.Input.Keyboard.KeyboardPlugin>();
      kb.addKey
        .calledWith(any())
        .mockReturnValue(mock<Phaser.Input.Keyboard.Key>());
      im.keyboard = kb;
      const s = mock<Phaser.Sound.WebAudioSoundManager>();
      const d = mock<IDoor>();
      const sut = await LiftManager.CreateAsync(doors, im, s);
      await sut.callLiftAsync(d, true);

      doors.forEach((d) => expect(d.CloseAsync).toHaveBeenCalled());
      expect(doors[2].OpenAsync).toHaveBeenCalled();
    });
  });
});
