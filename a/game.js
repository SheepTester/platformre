const blocks = ['stone', 'air', 'spawn', 'finish', 'grass', 'dirt', 'cave2',
  'lava', 'darkair', 'water', 'spike', 'trampoline', 'cloud', 'ice', 'sand',
  'seaweed', 'left', 'right', 'darkstone', 'darkair2', 'gem1', 'gem2', 'nojump',
  'mud', 'slime', 'slimedebrie'];

function desimplify(str) {
  return str.replace(/([a-z.@ ])(\d+)/g, (_, char, times) => char.repeat(+times));
}
function splitBy(str, charCount) {
  const arr = [];
  for (let i = 0; i < str.length; i += charCount)
    arr.push(str.slice(i, i + charCount));
  return arr;
}
function decodeLevelData({key, levels}) {
  return Object.values(levels).map(({solids, blocks}) => ({
    blocks: splitBy(desimplify(blocks), 18).map(col => col.split('').map(block => key[block] || 'air')),
    solids: splitBy(desimplify(solids), 18).map(col => col.split('').map(block => block === '@'))
  }));
}

function checkAxis(movement, currentCoord, otherCoord, isSolid, setPosition, onCollision, onNoCollision) {
  const anchor = movement < 0 ? currentCoord : currentCoord + PLAYER_SIZE;
  let next = movement < 0 ? Math.floor(anchor + Number.EPSILON) : Math.ceil(anchor - Number.EPSILON);
  let collided = false;
  while (movement < 0 ? next - anchor >= movement : next - anchor <= movement) {
    const min = Math.floor(otherCoord);
    const max = Math.ceil(otherCoord + PLAYER_SIZE);
    const loc = movement < 0 ? next - 1 : next;
    let collision = false;
    for (let i = min; i < max; i++) if (isSolid(loc, i)) {
      collision = true;
      break;
    }
    if (collision) {
      setPosition(movement < 0 ? next : next - PLAYER_SIZE);
      if (onCollision) onCollision();
      collided = true;
      break;
    }
    movement < 0 ? next-- : next++;
  }
  if (!collided) {
    setPosition(currentCoord + movement);
    if (onNoCollision) onNoCollision();
  }
}

const keys = {};
document.addEventListener('keydown', e => {
  switch (e.keyCode) {
    case 37: case 65: keys.left = true; break;
    case 38: case 87: keys.up = true; break;
    case 39: case 68: keys.right = true; break;
    case 40: case 83: keys.down = true; break;
    case 82: keys.restart = true; break;
  }
});
document.addEventListener('keyup', e => {
  switch (e.keyCode) {
    case 37: case 65: keys.left = false; break;
    case 38: case 87: keys.up = false; break;
    case 39: case 68: keys.right = false; break;
    case 40: case 83: keys.down = false; break;
    case 82: keys.restart = false; break;
  }
});

const BLOCK_SIZE = 20;
const PLAYER_SIZE = 16 / BLOCK_SIZE;
function ready([levelData, textureData, textures]) {
  levelData = decodeLevelData(levelData);
  const playerElem = document.getElementById('player');
  const canvas = document.getElementById('stage');
  const c = canvas.getContext('2d');
  let level = 0;
  let lastTime = Date.now(), nextFrameID = null;
  let player;
  function startLevel() {
    let startX = 0, startY = 0;
    levelData[level].blocks.forEach((col, x) => {
      col.forEach((block, y) => {
        if (textureData[block]) c.drawImage(textures, 0, textureData[block].y, 20, textureData[block].height || 20, x * 20, y * 20, 20, textureData[block].height || 20);
        if (block === 'spawn') startX = x, startY = y - 1;
      });
    });
    player = {x: startX, y: startY, xv: 0, yv: 0, onGround: false};
    renderPlayer();
  }
  function renderPlayer() {
    playerElem.style.transform = `translate(${player.x * 100 / PLAYER_SIZE}%, ${player.y * 100 / PLAYER_SIZE}%)`;
  }
  function getBlock(x, y) {
    if (x < 0 || x >= 24) return null;
    else return levelData[level].blocks[x][y] || null;
  }
  function isSolid(x, y) {
    if (x < 0 || x >= 24 || y < 0 || y >= 18) return true;
    else return levelData[level].solids[x][y];
  }
  function paint() {
    const now = Date.now();
    const elapsedTime = now - lastTime;
    const insideBlocks = [];
    for (let x = Math.floor(player.x), stop = Math.ceil(player.x + PLAYER_SIZE); x < stop; x++) {
      for (let y = Math.floor(player.y), stop = Math.ceil(player.y + PLAYER_SIZE); y < stop; y++) {
        insideBlocks.push(getBlock(x, y));
      }
    }
    if (elapsedTime !== 0)
      player.xv *= 1 / (elapsedTime / 40 + 1);
    player.yv += 0.00005 * elapsedTime;
    if (player.touchingFloor && keys.up) player.yv = -0.025;
    if (keys.left) player.xv -= 0.004;
    if (keys.right) player.xv += 0.004;
    const yMove = player.yv * elapsedTime;
    if (yMove !== 0) {
      checkAxis(yMove, player.y, player.x, (y, x) => isSolid(x, y), y => {
        player.y = y;
      }, () => {
        if (yMove < 0) player.touchingCeiling = true;
        else player.touchingFloor = true;
        player.yv = 0;
      }, () => {
        player.touchingCeiling = player.touchingFloor = false;
      });
    }
    const xMove = player.xv * elapsedTime;
    if (xMove !== 0) {
      checkAxis(xMove, player.x, player.y, (x, y) => isSolid(x, y), x => {
        player.x = x;
      }, () => {
        if (xMove < 0) player.touchingLeft = true;
        else player.touchingRight = true;
        player.xv = 0;
      }, () => {
        player.touchingLeft = player.touchingRight = false;
      });
    }
    renderPlayer();
    lastTime = now;
    nextFrameID = window.requestAnimationFrame(paint);
  }
  startLevel();
  paint();
}

Promise.all([
  fetch('./leveldata.json').then(r => r.json()),
  fetch('./texture-data.json').then(r => r.json()),
  new Promise(res => {
    const image = new Image();
    image.addEventListener('load', () => res(image));
    image.src = `./textures.png`;
  }),
  new Promise(res => document.addEventListener('DOMContentLoaded', res))
]).then(ready);
