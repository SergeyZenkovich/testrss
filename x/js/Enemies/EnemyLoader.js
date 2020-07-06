import EnemyConstructor from './EnemyConstructor';
import enemyPositions from './enemyPositions';
import enemySettings from './enemySettings';
import { nextCategory } from '../world/collisionCategories';

export default class EnemyLoader {
  constructor(scene, playerInstance, stairsArr) {
    this.scene = scene;
    this.playerInstance = playerInstance;
    this.stairsArray = stairsArr;
    this.enemiesArray = [];
    this.ENEMY_SLEEP_DISTANCE = 240;
  }

  create = () => {
    const collisionGroup = 0;
    Object.entries(enemyPositions.default)
      .filter((elem) => elem[0] !== 'default')
      .forEach((entry) => {
        const type = entry[0];
        const positionsArr = entry[1];

        const enemiesArr = positionsArr.map((position) => {
          const config = {};
          config.type = type;
          config.stairsArray = this.stairsArray;
          config.position = position;
          config.scene = this.scene;
          config.settings = enemySettings[type];
          config.playerInstance = this.playerInstance;
          config.collisionCategory = nextCategory();
          config.collisionGroup = collisionGroup;

          return new EnemyConstructor(config);
        });
        this.enemiesArray.push(enemiesArr);
      });
  };

  update = () => {
    this.enemiesArray.forEach((enemyType) => {
      enemyType.forEach((enemy) => {
        enemy.update();
      });
    });
  };
}
