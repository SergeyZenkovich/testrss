import Phaser from 'phaser';
import InteractionObject from './InteractionObject';
import collisionCategories from '../world/collisionCategories';

export default class Door extends InteractionObject {
  constructor(scene, x, y, beforeActionTexture, afterActionTexture) {
    super(scene, x, y, beforeActionTexture, afterActionTexture);
    this.createCompoundBody(x, y);
    this.interactionInfo.type = 'door';
  }

  createCompoundBody() {
    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    const { width: w, height: h } = this;
    const mainBody = Bodies.rectangle(w * 0.5, h * 0.5, w, h);
    const sensors = {
      around: Bodies.rectangle(w * 0.5, h * 0.5, w, h, { isSensor: true }),
    };
    const compoundBody = Body.create({
      parts: [mainBody, sensors.around],
    });
    compoundBody.collisionFilter.category = collisionCategories.ground;
    return compoundBody;
  }

  interact() {
    const info = this.interactionInfo;
    if (this.afterActionImage) {
      this.afterActionImage.setVisible(true);
    }
    this.destroy(this.scene);
    return info;
  }
}
