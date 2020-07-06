
import PersonAnimation from './PlayerAnimation';
import { getCanGoX, setCanGoX } from './playerStates/externalParams';
import collisionCategories from '../world/collisionCategories';

import level0json from '../../assets/level0Physics/level-start.xml.json';
import level0MiddleJson from '../../assets/level0Physics/level-middle.xml.json';
import level0EndJson from '../../assets/level0Physics/level-end.xml.json';
import level0stairsJson from '../../assets/level0Physics/level-start-stairs.xml.json';
import level0stairsMiddleJson from '../../assets/level0Physics/level-middle-stairs.xml.json';
import StairsInteraction from '../objects/stairs/StairsInteraction';
import sidesCollisionHandler from './playerStates/sidesCollisionHandler';

const groundArray = [];
const stairsArray = [];

export default class PlayerInteraction {
  constructor(scene) {
    this.playerInstance = {};
    this.player = this.playerInstance.player || {};
    this.movingKeysPressed = false;
    this.scene = scene;
    this.stairsInteraction = {};

    this.PLAYER_SPEED_X = 1.8;
  }

  preload() {
    this.playerAnimation = new PersonAnimation(this.scene);
    this.playerAnimation.preload();
  }

  create() {
    // this.playerInstance = new Player(this.scene, 109.36, 185.5, 'hero');
    // this.player = this.playerInstance.player;
    let player = this.playerAnimation.create();
    this.playerInstance = player;

    this.player = this.playerInstance.matterEnabledContainer;
    this.player.setCollisionCategory(collisionCategories.player);
    this.player.setCollidesWith([collisionCategories.ground]);

    this.ground = this.scene.matter.add.fromPhysicsEditor(250, 260.65, level0json.f_1);
    this.ground.frictionStatic = 0.5;
    this.ground.friction = 0.5;
    this.ground.collisionFilter.category = collisionCategories.ground;
    groundArray.push(this.ground);

    this.groundMiddle = this.scene.matter.add.fromPhysicsEditor(779, 261, level0MiddleJson.f_2);
    this.groundMiddle.collisionFilter.category = collisionCategories.ground;
    groundArray.push(this.groundMiddle);

    this.groundEnd = this.scene.matter.add.fromPhysicsEditor(1303, 273, level0EndJson.f_3);
    this.groundEnd.collisionFilter.category = collisionCategories.ground;
    groundArray.push(this.groundEnd);

    this.stairs = this.scene.matter.add.fromPhysicsEditor(486, 235, level0stairsJson.f_1);
    this.stairs.collisionFilter.category = collisionCategories.stairs;
    stairsArray.push(this.stairs);
    this.stairsMiddle = this.scene.matter.add
      .fromPhysicsEditor(770, 315.5, level0stairsMiddleJson.f_2);
    this.stairsMiddle.collisionFilter.category = collisionCategories.stairs;
    stairsArray.push(this.stairsMiddle);

    this.camera = this.scene.cameras.main;
    this.camera.startFollow(this.player, false, 0.1, 0.1);

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    const playerInteractionConfig = {
      scene: this.scene,
      cursors: this.cursors,
      stairsArray,
      playerInstance: this.playerInstance,
    };
    this.stairsInteraction = new StairsInteraction(playerInteractionConfig);
  }

  update() {
    this.playerAnimation.update(this.stairsInteraction);
    this.player.body.ignoreGravity = !this.movingKeysPressed
      && this.playerInstance.isTouching.body
      && !this.playerInstance.isTouching.left
      && !this.playerInstance.isTouching.right;
    setCanGoX(true);
    const { canLeft, canRight } = sidesCollisionHandler(this.playerInstance, this.scene);

    this.stairsInteraction.setStairsOverlap();

    if (this.cursors.left.isDown && getCanGoX() && canLeft) {
      console.log('go');
      this.movingKeysPressed = true;
      this.player.setVelocityX(-this.PLAYER_SPEED_X);
    } else if (this.cursors.right.isDown && getCanGoX() && canRight) {
      this.movingKeysPressed = true;
      this.player.setVelocityX(this.PLAYER_SPEED_X);
    } else {
      this.movingKeysPressed = false;
      this.player.setVelocityX(0);
    }

    this.stairsInteraction.controlYMovement();
  }
}


export { groundArray, stairsArray };
