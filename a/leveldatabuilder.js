// have Scratch project 67794652 extracted at /a/project

const levelData = {};

const projectJSON = require('./project/project.json');
projectJSON.children[1].costumes.forEach(costume => {
  levelData[costume.costumeName.slice(5)] = {solids: costume.baseLayerID};
});
projectJSON.children[0].costumes.slice(1).forEach(costume => {
  levelData[costume.costumeName.slice(5)].liquids = costume.baseLayerID;
});
console.log(JSON.stringify(levelData));
