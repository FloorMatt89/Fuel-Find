const { KDTree } = require('./kdtree.js');

const fs = require('fs');
const jsonData = fs.readFileSync('kdtree-coords.json', 'utf-8');
const coords = JSON.parse(jsonData);

const kdTree = new KDTree(coords);

module.exports = kdTree;