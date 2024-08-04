/// <reference path="../typings/phaser.d.ts" />

import Inventory from './inventory';
import DialogBase from './dialogbase';
import CharacterList from './characterlist';

class Actions extends DialogBase {

  
  constructor(handle, cursorKeys) {
    super(handle, cursorKeys);

  }

  create() {
    super.create(0, 0);

    const menus = ['Give', 'Take', 'Pick Up', 'Drop', 'Call Lift', 'Exit'];

    this.createDialogs();
    this.addMenuItems(menus);


  }
  
  createDialogs() {
    
    this.dialogs = {
      'inventory': new Inventory('inventory', this.cursorKeys),
      'characterlist': new CharacterList('characterlist', this.cursorKeys)
    };

    for(const d of Object.keys( this.dialogs)) {
      if(!this.scene.get(d)) {
        this.scene.add(d, this.dialogs[d]);
      }
    }

  }

  closeAllDialogs() {
    for(const d of Object.keys( this.dialogs)) {
      if(this.scene.get(d)) {
        this.scene.stop(d);
      }
    }
  }

  onGive() {
    
    this.scene.launch('inventory', (src, data) => {
    
      if(data && data.src && data.src.name &&  data.src.name!='Exit') {
        const item = data.src.name;
        
        src.scene.pause();
        
        this.scene.launch('characterlist', (src, data) => {
            

          const tgt = data.src.name;

          let  ret=null;

          if(tgt != 'Exit') {
            ret={action:'GIVE', item:item, tgt: tgt};
          }
          
          this.closeAllDialogs();
          this.closeAndReturn(ret);
        });
        
      } else {
        this.closeAllDialogs();

        this.closeAndReturn(null);
      }

    });

    this.scene.pause();

  }

  onExit(args) {
    console.log('shutting down dialog');
    
    this.closeAndReturn(null);
  }

}

export default Actions;