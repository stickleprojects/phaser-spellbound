/// <reference path="../typings/phaser.d.ts" />
import DialogBase from './dialogbase.js';

export default class Inventory extends DialogBase {

  constructor(handle, cursorKeys) {
    super(handle, cursorKeys);

    this.selectedItem = null;
  }

  create() {
    super.create(50, 30);
    const menus = ['Red Herring', 'Instruction Book', 'Pot of Glue', 'Exit'];

    this.addMenuItems(menus);


  }

  onClick(args) {
    console.log('you clicked ' + args);
    this.closeAndReturn(args);

  }

  onExit(args) {
    this.closeAndReturn(args);
  }
  update() {

    // navigate next using down arrow


  }
}

