export const menuInfo = [
  { ingredient: 'hotDog&sunnyEgg', score: 300 },
  { ingredient: 'hotDog&toast', score: 300 },
  { ingredient: 'coffee', score: 300 },
  { ingredient: 'sunnyEgg&toast', score: 300 },
  { ingredient: 'blueberry&toast', score: 300 },
  { ingredient: 'butter&toast', score: 300 },
  { ingredient: 'hotDog&rosemarry&sunnyEgg', score: 300, level2: true },
  { ingredient: 'bacon&hotDog&rosemarry&toast', score: 300, level2: true },
  { ingredient: 'bacon&rosemarry&sunnyEgg&toast', score: 300, level2: true },
  { ingredient: 'bacon&hotDog&sunnyEgg', score: 300, level2: true },
  { ingredient: 'bacon&hotDog&rosemarry&sunnyEgg', score: 300, level2: true },
];

const menuList = menuInfo.map((e) => {
  return e.ingredient;
});
export default menuList;
