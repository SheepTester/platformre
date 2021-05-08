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

const audio = new Audio('./waterflame_glorious_morning.mp3');
audio.loop = true;
function aggressivelyTryPlaying() {
  audio.play().catch(e => {
    setTimeout(aggressivelyTryPlaying, 0);
  });
}
aggressivelyTryPlaying();

const stages = ['red', 'yellow'];
const BLOCK_SIZE = 20;
const PLAYER_SIZE = 16 / BLOCK_SIZE;
function ready([levelData, textureData, textures]) {
  levelData = decodeLevelData(levelData);
  const playerElem = document.getElementById('player');
  const canvas = document.getElementById('stage');
  const c = canvas.getContext('2d');
  const startTime = Date.now();
  let level = 0, stage = 0, deaths = 0;
  let lastTime = startTime, nextFrameID = null;
  let player;
  let startX = 0, startY = 0;
  let spikes;
  function startLevel() {
    spikes = {};
    levelData[level].blocks.forEach((col, x) => {
      col.forEach((block, y) => {
        if (block === 'slime' && Math.random() < 0.2) block = 'slimedebrie';
        else if (block === 'gemX') block = 'gem' + (stage + 1);
        if (textureData[block]) {
          const height = textureData[block].height || 20;
          c.drawImage(textures, 0, textureData[block].y, 20, height, x * 20, y * 20 + 20 - height, 20, height);
        }
        if (block === 'spawn') startX = x, startY = y - 0.8 - Number.EPSILON;
        else if (block === 'spike') spikes[`${x}-${y - 1}`] = true;
        else if (block === 'cave2') {
          levelData[level].blocks[x][y - 1] = 'darkair';
          levelData[level].blocks[x][y - 2] = 'darkair';
        }
      });
    });
    player = {x: startX, y: startY, xv: 0, yv: 0, onGround: false, died: false};
    renderPlayer();
  }
  function renderPlayer() {
    playerElem.style.setProperty('--x', player.x / 24);
    playerElem.style.setProperty('--y', player.y / 18);
    // playerElem.style.transform = `translate(${player.x * 100 / PLAYER_SIZE}%, ${player.y * 100 / PLAYER_SIZE}%)`;
  }
  function getBlock(x, y) {
    if (x < 0 || x >= 24) return null;
    else return levelData[level].blocks[x][y] || null;
  }
  function isSolid(x, y) {
    if (x < 0 || x >= 24 || y < 0 || y >= 18) return true;
    else return levelData[level].solids[x][y];
  }
  function die(actualDeath) {
    deaths++; // includes restarts
    player = {
      x: startX,
      y: startY,
      xv: 0,
      yv: 0,
      onGround:
      false,
      died: actualDeath || player.died,
      // Preserve red dot timer on restart
      diedEnd: actualDeath ? Date.now() + 1000 : player.diedEnd
    };
    if (actualDeath) document.body.classList.add('died');
  }
  function insideSpike(x, y) {
    if (player.x + PLAYER_SIZE < x + 0.2) return false;
    else if (player.x > x + 0.8) return false;
    else if (player.y + PLAYER_SIZE < y + 0.2) return false;
    const playerX = player.x - x;
    const playerY = player.y - y;
    if (playerX * 3.2 - 1.56 < playerY + PLAYER_SIZE) return true;
    else if ((playerX + PLAYER_SIZE) * -3.2 + 1.64 < playerY + PLAYER_SIZE) return true;
    else return false;
  }
  function paint() {
    if (keys.restart) {
      die(false);
    }
    const now = Date.now();
    if (player.diedEnd && now > player.diedEnd) {
      if (player.died) {
        player.died = false;
        document.body.classList.remove('died');
        document.body.classList.add('ok');
        player.diedEnd = now + 500;
      } else {
        document.body.classList.remove('ok');
        player.diedEnd = null;
      }
    }
    const elapsedTime = now - lastTime;
    const frameFraction = elapsedTime * 30 / 1000;
    const insideBlocks = [], bottomBlocks = [], touchingBlocks = [], touchingSpikes = [];
    const startX = Math.floor(player.x), startY = Math.floor(player.y);
    const stopX = Math.ceil(player.x + PLAYER_SIZE), stopY = Math.ceil(player.y + PLAYER_SIZE);
    for (let x = startX; x < stopX; x++) {
      for (let y = startY; y < stopY; y++) {
        const block = getBlock(x, y);
        insideBlocks.push(block);
        if (spikes[`${x}-${y}`]) touchingSpikes.push([x, y]);
        if (x === startX && (player.touchingLeft || player.touchingRight)) {
          touchingBlocks.push(getBlock(player.touchingLeft ? startX -1 : stopX, y));
        }
      }
      if (player.touchingFloor) {
        bottomBlocks.push(getBlock(x, stopY));
      }
      if (player.touchingFloor || player.touchingCeiling) {
        touchingBlocks.push(getBlock(x, player.touchingCeiling ? startY - 1 : stopY));
      }
    }
    player.xv *= Math.pow(bottomBlocks.includes('ice') ? 0.97 : 0.9, frameFraction);
    if (insideBlocks.includes('water')) {
      player.yv += (0.5 - player.yv) * 0.6 * frameFraction;
      if (keys.left) player.xv -= (player.died ? 0.1 : 0.3) * frameFraction;
      if (keys.right) player.xv += (player.died ? 0.1 : 0.3) * frameFraction;
      if (keys.up) player.yv -= (player.died ? 1 : 3) * frameFraction;
      if (keys.down) player.yv += (player.died ? 1 : 2) * frameFraction;
      if (!document.body.classList.contains('water')) document.body.classList.add('water');
    } else {
      if (document.body.classList.contains('water')) document.body.classList.remove('water');
      if (insideBlocks.includes('slime')) {
        player.yv += (0.2 - player.yv) * 0.6 * frameFraction;
        if (keys.left) player.xv -= 0.1 * frameFraction;
        if (keys.right) player.xv += 0.1 * frameFraction;
        if (keys.up) player.yv -= (player.died ? 0.5 : 1.5) * frameFraction;
        if (keys.down) player.yv += (player.died ? 0.5 : 1) * frameFraction;
      } else {
        player.yv += 0.5 * frameFraction;
        if (keys.left) player.xv -= (player.died ? 0.5 : 1) * frameFraction;
        if (keys.right) player.xv += (player.died ? 0.5 : 1) * frameFraction;
        if (player.touchingFloor && !bottomBlocks.includes('nojump') && keys.up) player.yv = player.died ? -3 : -7;
      }
    }
    if (insideBlocks.includes('darkair')) {
      if (!document.body.classList.contains('dark')) document.body.classList.add('dark');
    } else {
      if (document.body.classList.contains('dark')) document.body.classList.remove('dark');
    }
    if (bottomBlocks.includes('trampoline')) { // these three technically used touchingBlocks, but that doesn't make sense
      player.yv = -16;
    }
    if (bottomBlocks.includes('left')) {
      player.xv -= 5 * frameFraction;
    }
    if (bottomBlocks.includes('right')) {
      player.xv += 5 * frameFraction;
    }
    if (bottomBlocks.includes('mud')) {
      player.xv *= Math.pow(0.5, frameFraction);
    }
    if (player.y >= 17.2 - Number.EPSILON) {
      die(true);
    } else if ((insideBlocks.includes('lava') || touchingBlocks.includes('lava')) && !insideBlocks.includes('water')) {
      // touching it can kill you because it's hot (also in line with Scratch)
      die(true);
    } else if (touchingSpikes.length && touchingSpikes.find(([x, y]) => insideSpike(x, y))) {
      die(true);
    } else if (touchingBlocks.includes('finish') || insideBlocks.includes('gemX')) {
      if (insideBlocks.includes('gemX')) {
        document.body.classList.add(stages[stage++]);
      }
      level++;
      if (level >= levelData.length) {
        const endScreen = document.getElementById('end-screen');
        endScreen.innerHTML = `
          <h1>Congratulations</h1>
          <p>Times died</p>
          <h2>${deaths}</h2>
          <p>Time taken (in seconds)</p>
          <h2>${(now - startTime) / 1000}</h2>
          <p><a href="./">Play again</a></p>
        `;
        endScreen.classList.add('show');
        return;
      }
      else startLevel();
    }
    const yMove = player.yv * frameFraction / BLOCK_SIZE;
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
    const xMove = player.xv * frameFraction / BLOCK_SIZE;
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
  new Promise(res => document.addEventListener('DOMContentLoaded', res, {once: true}))
]).then(ready);
