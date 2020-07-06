import { updateHealthBarUI } from '../../interface/UIHelpers';

const HERO_MAX_HEALTH = 100;

const stats = {
  aids: 2,
  bullets: 6,
  food: 2,
  keys: 0,
  health: HERO_MAX_HEALTH,
};

const looseHealth = (amount) => {
  stats.health -= amount;
  if (stats.health < 0) {
    stats.health = 0;
  }
  updateHealthBarUI(stats.health);
};

const setFullHealth = () => {
  stats.health = HERO_MAX_HEALTH;
}

export { stats, looseHealth, setFullHealth };
