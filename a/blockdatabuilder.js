// have Scratch project 67794652 extracted at /a/project

const blockData = {};

const fs = require('fs');
const projectJSON = require('./project/project.json');
function rename(from, to) {
  return new Promise((res, rej) => {
    fs.rename(from, to, err => err ? rej(err) : res());
  });
}
Promise.all(projectJSON.children[3].costumes.map(costume => {
  // blockData[costume.costumeName] = costume.baseLayerID;

  // UNCOMMENT TO RENAME:
  // return rename(`./project/${costume.baseLayerID}.png`, `./images/${costume.costumeName}.png`);
})).then(() => {
  projectJSON.children[3].scripts[3][2].slice(2).forEach(blocks => {
    const colour = (16777216 + blocks[1][1]).toString(16).padStart(6, '0');
    switch (colour) {
      case 'cc0099':
        blockData[colour] = 'gemX';
        break;
      case '009933':
        blockData[colour] = 'slime';
        break;
      default:
        blockData[colour] = blocks[2][0][1];
    }
  });
  console.log(JSON.stringify(blockData));
});
