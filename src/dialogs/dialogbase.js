/// <reference path="../typings/phaser.d.ts" />

import { NinePatch } from '@koreez/phaser3-ninepatch';
import Phaser from 'phaser';
import { TextButton } from '../game-objects/textbutton';

class DialogBase extends Phaser.Scene {


  constructor(handle, cursorKeys) {
    super(handle);

    this.cursorKeys = cursorKeys;

  }

  
  closeAndReturn(data) {
    console.log('shutting down dialog');
    
    this.closeCallback(this, data);
  }
  loadUI() {

    if (!this.textures.exists('ui')) this.load.multiatlas('ui', 'assets/ui/rpg_ui.json', 'assets/ui');
    if (!this.textures.exists('uifont')) this.load.bitmapFont('uifont', 'assets/ui/arcade.png', 'assets/ui/arcade.xml');

  }

  preload() {
    console.log('preload');
    this.loadUI();


  }
  init(args) {

    this.closeCallback = args;
  }
  createBorder(dimensions) {
    var np = new NinePatch(
      this,
      0,
      0,
      46,
      46,
      'ui',
      'splitted/borders/single/single_borders', {
        top: 10
      }
    );

    const offset = 4;
    np.resize(dimensions.width + offset * 2, dimensions.height + offset * 2);
    np.x = 0 + (np.width / 2) - offset;
    np.y = 0 + (np.height / 2) - offset;

    this.add.existing(np);

  }

  hasMethod(obj, name) {
    const desc = Object.getOwnPropertyDescriptor(obj, name);
    return !!desc && typeof desc.value === 'function';
  }
  getInstanceMethodNames(obj, stop) {
    let array = [];
    let proto = Object.getPrototypeOf(obj);
    while (proto && proto !== stop) {
      Object.getOwnPropertyNames(proto)
        .forEach(name => {
          if (name !== 'constructor') {
            if (this.hasMethod(proto, name)) {
              array.push(name);
            }
          }
        });
      proto = Object.getPrototypeOf(proto);
    }
    return array;
  }

  addMenuItems(menuItems) {

    let y = 0;
    
    const x = 10;
    const gap = 15;


    menuItems.forEach(itm => {
      const btn = new TextButton(this, itm.replace(' ', ''), x, y, itm, undefined, (args) => {
        console.log('you clicked ' + args.src.name);

        // find the click event
        const eventNames = [
          'on' + args.src.name,
          'onClick'];
        for (const eventName of eventNames) {
          let eventTgt = args.src.scene;
          let methods = this.getInstanceMethodNames(eventTgt);
          if (methods.includes(eventName)) {
            console.log('invoking ' + eventName);
            eventTgt[eventName](args);
            break;
          }
        }
      });

      this.add.existing(btn);
      y += gap;

    });
  }
  create(x, y, width = 250, height = 100) {

    const dims = {
      width: width,
      height: height
    };
    this.cameras.main.setViewport(x, y, dims.width, dims.height);
    this.cameras.main.setBackgroundColor('#ff00ff');
    this.add.image(0, 0, 'ui', 'splitted/borders/paper background');

    this.createBorder(dims);

  }

}

export default DialogBase;