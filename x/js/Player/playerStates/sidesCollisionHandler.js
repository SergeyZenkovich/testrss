// eslint-disable-next-line import/no-cycle
import { groundArray } from '../PlayerInteraction';
import { doors } from '../../setters/level0';

const sidesCollisionHandler = (playerInstance, scene) => {
  let canGoLeft = true;
  let canGoRight = true;
  let canGoDown = true;
  const leftSensor = playerInstance.sensors.left;
  const rightSensor = playerInstance.sensors.right;
  const groundSensor = playerInstance.sensors.bottom;
  const currentDoors = doors.filter((door) => door.body !== undefined);

  const overlapHandler = (bodyA) => {
    if (leftSensor === bodyA) {
      canGoLeft = false;
    } else if (rightSensor === bodyA) {
      canGoRight = false;
    }
  };

  const downHandler = () => {
    canGoDown = false;
  };

  scene.matter.overlap(groundSensor, groundArray, downHandler);

  scene.matter.overlap(
    [leftSensor, rightSensor],
    [...currentDoors, ...groundArray],
    overlapHandler,
  );

  return {
    canLeft: canGoLeft,
    canRight: canGoRight,
    canDown: canGoDown,
  };
};

export default sidesCollisionHandler;
