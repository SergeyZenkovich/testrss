const collisionCategories = {};

let currentCategory = 0;

const nextCategory = () => {
  if (currentCategory === 0) {
    currentCategory = 1;
  } else {
    currentCategory *= 2;
  }
  if (currentCategory > 128) {
    currentCategory = 1;
  }
  return currentCategory;
};


collisionCategories.player = nextCategory();
collisionCategories.playerBodySensor = nextCategory();
collisionCategories.ground = nextCategory();
collisionCategories.stairs = nextCategory();


export default collisionCategories;
export { nextCategory };
