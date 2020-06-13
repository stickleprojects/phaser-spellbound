/// <reference path="../typings/phaser.d.ts" />
import DialogBase from './dialogbase.js';


export default class CharacterList extends DialogBase {


  constructor(handle, cursorKeys) {
    super(handle, cursorKeys);


  }

  create() {
    super.create(70, 70);

    const menus = ['Samsun the Strong', 'Elrand Half-elven', 'Charlie Sheen', 'Your Mum',  'Exit'];

    this.addMenuItems(menus);


  }

  onClick(args) {
    console.log('you clicked ' + args);
    this.closeAndReturn(args);

  }
  onExit(args) {
    console.log('shutting down dialog');
    
    this.closeAndReturn(args);
  }

}
