import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';
import png_machine from '../public/vendingmachine.png';
import png_adam from '../public/character/adam.png';
import json_adam from '../public/character/adam.json';
import { CharacterComponent } from './components/character/Character';
import { ChatComponent } from './components/chat/Chat';
import { KeyboardComponent } from './components/keyboard/Keyboard';
import { createAnimations } from './components/anims/anims';
import { MachineComponent } from './components/items/machine';
import png_bubble from '/public/speechBubble.png'

import png_gd from '/public/tiles/17_Garden_32x32.png';
import png_ct from '/public/tiles/2_City_Terrains_32x32.png';
import png_vc from '/public/tiles/10_Vehicles_32x32.png';
import png_cp from '/public/tiles/11_Camping_32x32.png';

import json_testmap from '/public/tiles/remap.json';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private client = new Client('ws://localhost:2567');
  private room: Room;
  private chatComponent: ChatComponent;
  private characterComponent: CharacterComponent;
  private keyboardComponent: KeyboardComponent;
  private machineComponent: MachineComponent;
  public cp_object_layer:Phaser.Tilemaps.TilemapLayer;
  public vc_object_layer:Phaser.Tilemaps.TilemapLayer;
  public gd_object_layer:Phaser.Tilemaps.TilemapLayer; 

  constructor() {
    super('game-scene');
  }

  preload() {
    this.load.atlas('character', png_adam, json_adam);
    this.load.spritesheet('machine', png_machine, {
      frameWidth: 64,
      frameHeight: 64,
      
    });
    this.load.image('speechBubble', png_bubble);

    this.load.image('gd',png_gd);
    this.load.image('ct',png_ct);
    this.load.image('vc',png_vc);
    this.load.image('cp',png_cp);
    this.load.tilemapTiledJSON('testmap',json_testmap);
  }

  async create() {
    try {
      this.room = await this.client.joinOrCreate('my_room');
      console.log('Joined successfully!');

      createAnimations(this.anims);

      this.machineComponent = new MachineComponent(this.room);
      this.chatComponent = new ChatComponent(this.room);
      this.characterComponent = new CharacterComponent(
        this.room,
        this.input.keyboard.createCursorKeys()
      );
      this.keyboardComponent = new KeyboardComponent(
        this.room,
        this.input.keyboard.createCursorKeys()
      );

      this.chatComponent.initialize(this);
      this.characterComponent.initialize(this);
      this.machineComponent.initialize(this);

      this.cameras.main.zoom = 1.5

      const map = this.make.tilemap({key:'testmap'});
      const cptile = map.addTilesetImage('11_Camping_32x32',"cp");
      const cttile = map.addTilesetImage('2_City_Terrains_32x32','ct');
      const gdtile = map.addTilesetImage('17_Garden_32x32','gd');
      const vctile = map.addTilesetImage('10_Vehicles_32x32','vc');
  
      const cp_tile_layer = map.createLayer("cp_tile_layer",cptile,0,0);
      const ct_tile_layer = map.createLayer("ct_tile_layer",cttile,0,0);
      const gd_tile_layer = map.createLayer("gd_tile_layer",gdtile,0,0);
      this.cp_object_layer= map.createLayer("cp_object_layer",cptile,0,0);
      this.vc_object_layer = map.createLayer("vc_object_layer",vctile,0,0);
      this.gd_object_layer = map.createLayer("gd_object_layer",gdtile,0,0);
      
      this.cp_object_layer.setCollisionByProperty({ collides: true });
      this.vc_object_layer.setCollisionByProperty({ collides: true });
      this.gd_object_layer.setCollisionByProperty({ collides: true });


      
      
    } catch (e) {
      console.error(e);
    }
  }

  update(time: number, delta: number): void {
    if (this.keyboardComponent) {
      this.keyboardComponent.update();
    }

    if (this.characterComponent) {
      if(this.characterComponent.currentPlayer){
        this.physics.add.collider(this.characterComponent.currentPlayer,this.cp_object_layer);
        this.physics.add.collider(this.characterComponent.currentPlayer,this.gd_object_layer);
        this.physics.add.collider(this.characterComponent.currentPlayer,this.vc_object_layer);
        }
      this.characterComponent.update();
    }
  }
}
