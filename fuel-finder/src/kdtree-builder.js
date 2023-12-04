const { getRandomCoordinate } = require('./kdtree.js');
const fs = require('fs');

const coords = [];
for (let i = 0; i < 100000; i++) {
  coords[i] = getRandomCoordinate();
}

const jsonData = JSON.stringify(coords);
fs.writeFileSync('kdtree-coords.json', jsonData);

console.log('KD tree built and saved to kdtree-coords.json');