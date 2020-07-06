import Phaser from 'phaser';
import collisionCategories from '../world/collisionCategories';
import { doors } from '../setters/level0';
import { looseHealth } from '../Player/playerStates/stats';
import { groundArray } from '../Player/PlayerInteraction';


export default class EnemyConstructor {
  constructor(config) {
    this.config = config;
    this.scene = config.scene;
    this.activeDoors = doors;
    this.playerInstance = config.playerInstance;
    this.player = this.playerInstance.matterEnabledContainer;
    this.type = config.type;
    this.heightOffset = config.settings.heightOffset;
    this.height = config.settings.height;
    this.position = config.position;
    this.collisionCategory = config.collisionCategory;
    this.speed = config.settings.speed;
    this.currentSpeed = 0;
    this.blockDoor = false;
    this.x = config.position.x;
    this.y = config.position.y;
    this.ATTACK_DISTANCE = 3;
    this.attackCounter = 0;
    this.walkingInterval = 100;
    this.currentWalking = 0;
    this.stayingInterval = 15;
    this.currentStaying = 0;
    this.direction = '';
    this.stop = false;
    this.walkingIntervalsCount = 3;
    this.currentWalkingIntervals = 0;
    this.isEnemySeePlayer = false;
    this.isEnemySawPlayer = false;
    this.canGoLeft = true;
    this.canGoRight = true;
    this.enemy = this.scene.matter.add
      .image(this.x, this.y, config.type);

    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    const { width: w, height: h } = this.enemy;
    this.mainBody = Bodies.rectangle(w * 0.5, h * 0.5 + 1, 6, 18, { chamfer: { radius: 2 }, label: 'main body' });
    this.sensors = {
      detect: Bodies.rectangle(w * 0.5, h * 0.5, 270, h * 0.5, { isSensor: true }),
      left: Bodies.rectangle(w * 0.4, h * 0.5, 2, 4, { isSensor: true, label: 'sensor left' }),
      right: Bodies.rectangle(w * 0.6, h * 0.5, 2, 4, { isSensor: true, label: 'sensor right' }),
      body: Bodies.rectangle(w * 0.5, h * 0.5 - this.heightOffset, 6, this.height,
        { chamfer: { radius: 2 }, isSensor: true, label: 'body sensor' }),
    };
    const compoundBody = Body.create({
      parts: [this.mainBody, this.sensors.detect, this.sensors.body,
        this.sensors.left, this.sensors.right],
      frictionStatic: 0.1,
      frictionAir: 0.02,
      friction: 0.1,
    });

    this.enemy
      .setExistingBody(compoundBody)
      .setScale(1)
      .setFixedRotation()
      .setPosition(this.x, this.y)
      .setCollisionCategory(this.collisionCategory)
      .setCollisionGroup(config.collisionGroup)
      .setCollidesWith([collisionCategories.ground]);
  }

  onDetectDoors = (sensor, door) => {
    if ((this.player.x < door.position.x && door.position.x < sensor.position.x)
      || (this.player.x > door.position.x && door.position.x > sensor.position.x)) {
      this.blockDoor = true;
    }
  };

  attack = () => {
    const framesDelay = 10;

    if (this.attackCounter === framesDelay / 2) {
      // здесь можно вставить анимацию атаки
    }
    this.attackCounter += 1;
    if (this.attackCounter === framesDelay) {
      this.attackCounter = 0;
      looseHealth(10);
    }
  };

  onDetect = () => {
    this.activeDoors = doors.filter((door) => door.body !== undefined);
    this.scene.matter.overlap(this.sensors.detect, this.activeDoors, this.onDetectDoors);
    if (!this.blockDoor) {
      if (this.player.x < this.enemy.x - this.ATTACK_DISTANCE) {
        this.currentSpeed = -this.speed;
        this.attackCounter = 0;
      } else if (this.player.x > this.enemy.x + this.ATTACK_DISTANCE) {
        this.currentSpeed = this.speed;
        this.attackCounter = 0;
      } else {
        this.currentSpeed = 0;
        if (this.player.x < this.enemy.x) {
          this.attack('right');
        } else if (this.player.x >= this.enemy.x) {
          this.attack('left');
        }
      }
    }
  };

  sidesSensorsHandler = (bodyA) => {
    if (bodyA === this.sensors.left) {
      this.canGoLeft = false;
    } else if (bodyA === this.sensors.right) {
      this.canGoRight = false;
    }
  };

  enemyStairsOverlap = (bodyA, bodyB) => {
    if (bodyA.position.y < bodyB.position.y) {
      this.enemy.setCollidesWith([collisionCategories.ground, collisionCategories.stairs]);
    }
  };

  enemySearchingPlayer = () => {
    this.activeDoors = doors.filter((door) => door.body !== undefined);
    this.scene.matter.overlap(
      [this.sensors.left, this.sensors.right],
      [...groundArray, ...this.activeDoors], this.sidesSensorsHandler,
    );

    if (this.currentWalkingIntervals < this.walkingIntervalsCount) {
      if (this.currentWalking === 0 && this.currentStaying === 0) {
        this.direction = (Math.random() < 0.5) ? 'left' : 'right';
      }
    } else {
      this.isEnemySawPlayer = this.isEnemySeePlayer;
      this.currentWalkingIntervals = 0;
    }

    if (this.direction === 'left' && this.currentWalking < this.walkingInterval) {
      this.currentSpeed = (this.canGoLeft && !this.stop) ? -this.speed : 0;
      if (this.currentSpeed === 0) {
        this.stop = true;
      }
      this.currentWalking += 1;
    } else if (this.direction === 'right' && this.currentWalking < this.walkingInterval) {
      this.currentSpeed = (this.canGoRight && !this.stop) ? this.speed : 0;
      if (this.currentSpeed === 0) {
        this.stop = true;
      }
      this.currentWalking += 1;
    } else if (this.currentWalking === this.walkingInterval
      && this.currentStaying < this.stayingInterval) {
      this.currentSpeed = 0;
      this.currentStaying += 1;
    }

    if (this.currentWalking === this.walkingInterval
      && this.currentStaying === this.stayingInterval) {
      this.currentWalking = 0;
      this.currentStaying = 0;
      this.currentWalkingIntervals += 1;
    }
  };

  enemyCheckingPlayer = () => {
    const sensorPlayerOverlap = this.scene.matter
      .overlap(this.sensors.detect, this.playerInstance.sensors.body, this.onDetect);
    this.isEnemySeePlayer = sensorPlayerOverlap && !this.blockDoor;
    if (this.isEnemySawPlayer && !this.isEnemySeePlayer) {
      this.enemySearchingPlayer();
    }
  };

  update = () => {
    this.enemy.setCollidesWith([collisionCategories.ground]);
    this.enemy.body.ignoreGravity = false;
    this.currentSpeed = 0;
    this.scene.matter.overlap(this.sensors.body, this.config.stairsArray, this.enemyStairsOverlap);
    this.enemyCheckingPlayer();
    // здесь можно вставить анимацию врага, в зависимости от this.currentSpeed
    this.enemy.setVelocityX(this.currentSpeed);
    this.blockDoor = false;
    if (this.isEnemySeePlayer) {
      this.isEnemySawPlayer = true;
    }
    this.canGoLeft = true;
    this.canGoRight = true;
    this.stop = false;
  }
}
