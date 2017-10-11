// https://gist.github.com/blixt/f17b47c62508be59987b
class Random {
  constructor(seed) {
    this._seed=seed%2147483647;
    if (this._seed<=0) this._seed+=2147483646;
  }
  next() {
    return this._seed=this._seed*16807%2147483647;
  }
  nextFloat() {
    return (this.next()-1)/2147483646;
  }
}
var config={
  CHUNK_SIZE:16,
  TEXTURE_SIZE:1,
  HEIGHT_MAP_SIZE:4,
  SEA_LEVEL:10,
  SEED:45345,
  CURSOR_TEXTURE_POS:[0,0],
  PLAYER:{
    HEIGHT:1.75,
    WIDTH:0.75
  },
  CAMERA_GLIDE_SPEED:3,
  UPDATE_RADIUS:3
};
var chunks={},
backchunks={},
heights={},
blocksize=16,
scroll={x:0,y:0},
canvas=document.querySelector('#canvas'),
c=canvas.getContext('2d'),
textures=document.querySelector('#textures'),
keys={},
mouse={down:false,x:0,y:0},
player=new Collidable(config.PLAYER.WIDTH*2,config.PLAYER.HEIGHT*2,(x,y)=>{
  // the collision detector will see the world twice as big, so we can add stairs/slabs
  // hopefully in the future I can implement slope detection so the player automatically goes up half-blocks
  var bl=block(Math.floor(x/2),Math.floor(y/2));
  if (bl) {
    bl=blockData[bl];
    if (bl.collision) {
      /* 0 1
         2 3 */
      return bl.collision[mod(y,2)*2+mod(x,2)];
    }
    else return bl.solid;
  }
  else return false;
});
var blockData={
  void:{solid:0,destroyableByLiquid:1},
  air:{colour:"#CEECFF",solid:0},
  dirt:{colour:"#866247",solid:1,grainy:1},
  grass:{colour:"#866247",image:[1,0],solid:1,grainy:1},
  stone:{colour:"#919596",solid:1},
  darkerstone:{colour:"#636667",solid:1},
  oaktrunk:{colour:"#74674F",solid:1,flamable:1},
  oaktreaves:{colour:"#719C34",solid:1,flamable:1},
  oakleaves:{colour:"#82B53C",solid:1,flamable:1},
  oaksapling:{image:[7,0],solid:0,groundCover:1,destroyableByLiquid:1,flamable:1},
  rose:{image:[2,0],solid:0,groundCover:1,destroyableByLiquid:1,flamable:1},
  goldenrod:{image:[3,0],solid:0,groundCover:1,destroyableByLiquid:1,flamable:1},
  myosotis:{image:[4,0],solid:0,groundCover:1,destroyableByLiquid:1,flamable:1},
  sand:{colour:"#EED38B",solid:1,grainy:1},
  palmtrunk:{colour:"#D1BE94",solid:1,flamable:1},
  palmtreaves:{colour:"#87BB25",solid:1,flamable:1},
  palmleaves:{colour:"#99D42A",solid:1,flamable:1},
  palmsapling:{image:[9,0],solid:0,groundCover:1,destroyableByLiquid:1,flamable:1},
  tallgrass:{image:[5,0],solid:0,groundCover:1,destroyableByLiquid:1,flamable:1},
  vapour:{colour:"#FFFFFF",solid:0,gas:1,condensesTo:"water"},
  seawater:{colour:"#69D2E7",solid:0,liquid:1,evaporatesTo:"vapour"},
  water:{colour:"#A7DBD8",solid:0,liquid:1,evaporatesTo:"vapour"},
  pinetrunk:{colour:"#4E342E",solid:1,flamable:1},
  pinetreaves:{colour:"#304D07",solid:1,flamable:1},
  pineleaves:{colour:"#406609",solid:1,flamable:1},
  pinesapling:{image:[8,0],solid:0,groundCover:1,destroyableByLiquid:1,flamable:1},
  autumntrunk:{colour:"#9E715C",solid:1,flamable:1},
  autumntreaves1:{colour:"#D7AC56",solid:1,flamable:1},
  autumnleaves1:{colour:"#F0C060",solid:1,flamable:1},
  autumntreaves2:{colour:"#D78241",solid:1,flamable:1},
  autumnleaves2:{colour:"#F09048",solid:1,flamable:1},
  autumntreaves3:{colour:"#C0412A",solid:1,flamable:1},
  autumnleaves3:{colour:"#D84830",solid:1,flamable:1},
  autumnsapling:{image:[0,1],solid:0,groundCover:1,destroyableByLiquid:1,flamable:1},
  gravel:{colour:"#B8BCBD",solid:1,grainy:1},
  basalt:{colour:"#8A796C",solid:1},
  basaltgravel:{colour:"#A48F80",solid:1,grainy:1},
  dirtslab:{image:[6,0],solid:1,collision:[0,0,1,1],grainy:1},
  lava:{colour:"#FF6015",solid:0,liquid:1}
},
scrollvel={x:0,y:0,zoom:blocksize},
generatingChunks=[],
currentblock="_random_";
function resize() {
  var pxr=SHEEP.pixelratio();
  canvas.width=innerWidth*pxr;
  canvas.height=innerHeight*pxr;
  c.scale(pxr,pxr);
  c.fillStyle='red';
}
function mod(a,b) {
  return a-Math.floor(a/b)*b;
}
window.addEventListener("resize",resize,false);
resize();
window.addEventListener("keydown",e=>{
  keys[e.keyCode]=true;
},false);
window.addEventListener("keyup",e=>{
  keys[e.keyCode]=false;
},false);
window.addEventListener("mousedown",e=>{
  mouse.down=true;
  [mouse.x,mouse.y]=[e.clientX,e.clientY];
},false);
window.addEventListener("mousemove",e=>{
  [mouse.x,mouse.y]=[e.clientX,e.clientY];
},false);
window.addEventListener("mouseup",e=>{
  mouse.down=false;
},false);
window.addEventListener("wheel",e=>{
  if (e.deltaY<0) scrollvel.zoom*=-e.deltaY/250+1;
  else scrollvel.zoom/=e.deltaY/250+1;
},false);
function generateHeight(chunkx) {
  var heightchunkx=Math.floor(chunkx/config.HEIGHT_MAP_SIZE)*config.HEIGHT_MAP_SIZE,
  randomness=20,
  random=new Random(config.SEED*heightchunkx),
  height=[],
  doneheights=[];
  height[0]=height[config.CHUNK_SIZE*config.HEIGHT_MAP_SIZE-1]=0;
  doneheights.push(0,height.length-1);
  for (;doneheights.length<height.length;) {
    for (var i=0;i<doneheights.length-1;i+=2) {
      if (doneheights[i+1]-doneheights[i]<2) {
        i--;
      } else {
        var xpos=Math.round((doneheights[i]+doneheights[i+1])/2);
        height[xpos]=(height[doneheights[i]]+height[doneheights[i+1]])/2+random.nextFloat()*randomness*2-randomness;
        doneheights.splice(i+1,0,xpos);
      }
    }
    randomness/=2;
  }
  for (var i=0;i<height.length;i++) height[i]=Math.round(height[i]);
  for (var i=0;i<config.HEIGHT_MAP_SIZE;i++) {
    heights[heightchunkx+i]=height.slice(i*config.CHUNK_SIZE,(i+1)*config.CHUNK_SIZE);
  }
  return heights[chunkx];
}
function generateChunk(chx,chy) {
  // TEMP - actual generation one day but not now
  var blocks=[],
  backblocks=[],
  height=heights[chx]||generateHeight(chx),
  random=new Random(chx*chy*config.SEED);
  for (var y=0;y<config.CHUNK_SIZE;y++) {
    for (var x=0;x<config.CHUNK_SIZE;x++) {
      var h=y+chy*config.CHUNK_SIZE;
      if (height[x]<config.SEA_LEVEL) {
        if (h<height[x]-1) backblocks.push('air'),blocks.push('void');
        else if (h===height[x]-1) {
          backblocks.push('air');
          switch (Math.floor(random.nextFloat()*12)) {
            case 0:
            case 1:
            case 2:
              blocks.push('tallgrass');
              break;
            case 3:
              blocks.push('rose');
              break;
            case 4:
              blocks.push('goldenrod');
              break;
            case 5:
              blocks.push('myosotis');
              break;
            case 6:
              blocks.push('oaksapling');
              break;
            case 7:
              blocks.push('autumnsapling');
              break;
            default:
              blocks.push('void');
          }
        }
        else if (h===height[x]) backblocks.push('air'),blocks.push('grass');
        else if (h<height[x]+Math.floor(random.nextFloat()*5+3)) backblocks.push('air'),blocks.push('dirt');
        else {
          blocks.push('stone');
          backblocks.push('darkerstone');
        }
      } else {
        if (h<config.SEA_LEVEL) backblocks.push('air'),blocks.push('void');
        else if (h<height[x]) backblocks.push('air'),blocks.push('seawater');
        else if (h<height[x]+Math.floor(random.nextFloat()*5+3)) {
          backblocks.push('air');
          switch (Math.floor(random.nextFloat()*3)) {
            case 0:
              blocks.push('sand');
              break;
            case 1:
              blocks.push('gravel');
              break;
            case 2:
              blocks.push('dirt');
              break;
            default:
              blocks.push('sand');
          }
        }
        else blocks.push('stone'),backblocks.push('darkerstone');
      }
    }
  }
  chunks[`${chx},${chy}`]=blocks;
  backchunks[`${chx},${chy}`]=backblocks;
}
function block(x,y,front=true,newblock) {
  var chunk=`${Math.floor(x/config.CHUNK_SIZE)},${Math.floor(y/config.CHUNK_SIZE)}`;
  if (front) {
    if (chunks[chunk]) {
      if (newblock) return chunks[chunk][mod(y,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)]=newblock;
      else return chunks[chunk][mod(y,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)];
    }
    else return null;
  } else {
    if (backchunks[chunk]) {
      if (newblock) return backchunks[chunk][mod(y,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)]=newblock;
      else return backchunks[chunk][mod(y,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)];
    }
    else return null;
  }
}
function updateBlock(setblock,x,y,front) {
  var bl=block(x,y,front),data=blockData[bl],t;
  if (bl) {
    if (data.grainy) {
      t=block(x,y+1,front);
      if (t&&!blockData[t].solid) {
        setblock(x,y+1,bl);
        setblock(x,y,blockData[t].groundCover?'void':t);
      }
    }
    if (data.groundCover) {
      t=block(x,y+1,front);
      if (!t||!blockData[t].solid) {
        setblock(x,y,'void');
      }
    }
    if (data.liquid) {
      var xmove=Math.floor(Math.random()*2)?-1:1;
      if ((t=block(x,y+1,front))&&blockData[t].destroyableByLiquid) {
        // if ((t=block(x+xmove,y+1,front))&&blockData[t].destroyableByLiquid) setblock(x,y,'void'),setblock(x+xmove,y+1,bl);
        // else
        setblock(x,y,'void'),setblock(x,y+1,bl);
      }
      else if ((t=block(x+xmove,y,front))&&blockData[t].destroyableByLiquid) setblock(x,y,'void'),setblock(x+xmove,y,bl);
      else {
        for (var i=1;i<9;i+=2) {
          if (data.evaporatesTo&&(t=block(x+Math.floor(i/3)-1,y+i%3-1,front))&&blockData[t].destroyableByLiquid&&!Math.floor(Math.random()*200)) {
            setblock(x,y,data.evaporatesTo);
            break;
          } else {
            var change=false;
            switch (bl) {
              case 'water':
                if (block(x+Math.floor(i/3)-1,y+i%3-1,front)==='seawater'&&!Math.floor(Math.random()*20)) setblock(x,y,'seawater');
                break;
              case "lava":
                if (block(x+Math.floor(i/3)-1,y+i%3-1,front)==='water')
                  setblock(x+Math.floor(i/3)-1,y+i%3-1,'vapour'),setblock(x,y,'basalt');
                else if (block(x+Math.floor(i/3)-1,y+i%3-1,front)==='seawater')
                  setblock(x+Math.floor(i/3)-1,y+i%3-1,'vapour'),setblock(x,y,'basalt');
                break;
            }
            if (change) break;
          }
        }
      }
    }
    if (data.gas) {
      if (data.condensesTo&&!Math.floor(Math.random()*(y>0?400:y<-380?20:400-y))) setblock(x,y,data.condensesTo);
      else {
        var xmove=Math.floor(Math.random()*2)?-1:1;
        if ((t=block(x,y-1,front))&&blockData[t].destroyableByLiquid) setblock(x,y,'void'),setblock(x,y-1,bl);
        // allows vapour to seep through corner caps:
        else if ((t=block(x+xmove,y-1,front))&&blockData[t].destroyableByLiquid&&!Math.floor(Math.random()*10)) setblock(x,y,'void'),setblock(x+xmove,y-1,bl);
        else if ((t=block(x+xmove,y,front))&&blockData[t].destroyableByLiquid) setblock(x,y,'void'),setblock(x+xmove,y,bl);
      }
    }
  }
}
function update(front) {
  var playerchx=Math.floor(player.x/2/config.CHUNK_SIZE)*config.CHUNK_SIZE,
  playerchy=Math.floor(player.y/2/config.CHUNK_SIZE)*config.CHUNK_SIZE,
  updateradius=config.UPDATE_RADIUS*config.CHUNK_SIZE,
  temp=[],
  setblock=(blx,bly,bl)=>{
    if (blx<=x&&bly<y) block(blx,bly,front,bl);
    else temp[`${blx},${bly}`]=bl;
  };
  for (var x=playerchx-updateradius,i=0;x<=playerchx+updateradius;x++) {
    for (var y=playerchy-updateradius;y<=playerchy+updateradius;y++,i++) {
      if (temp[`${x},${y}`]) block(x,y,front,temp[`${x},${y}`]),temp[`${x},${y}`]=null;
      else updateBlock(setblock,x,y,front);
    }
  }
  for (var coord in temp) block(+coord.slice(0,coord.indexOf(',')),+coord.slice(coord.indexOf(',')+1),front,temp[coord]);
}
function render(front=true,drawui=false) {
  var renderoriginx=mod((innerWidth/2-scroll.x),blocksize)-blocksize,
  idoriginx=Math.floor((scroll.x-innerWidth/2)/blocksize),
  stopx=Math.ceil(innerWidth/blocksize)+1,
  selectedx=Math.floor((mouse.x-renderoriginx)/blocksize),
  renderoriginy=mod((innerHeight/2-scroll.y),blocksize)-blocksize,
  idoriginy=Math.floor((scroll.y-innerHeight/2)/blocksize),
  stopy=Math.ceil(innerHeight/blocksize)+1,
  selectedy=Math.floor((mouse.y-renderoriginy)/blocksize),
  lastblock;
  for (var y=0;y<stopy;y++) {
    lastblock={};
    for (var x=0;x<stopx;x++) {
      var bl=block(idoriginx+x,idoriginy+y,front);
      if (bl!==lastblock.block) {
        if (lastblock.block) {
          if (blockData[lastblock.block].colour) {
            c.fillStyle=blockData[lastblock.block].colour;
            c.fillRect(lastblock.startx,renderoriginy+y*blocksize,blocksize*lastblock.count,blocksize);
          }
          if (blockData[lastblock.block].image) for (var i=0;i<lastblock.count;i++) {
            c.drawImage(
              textures,
              blockData[lastblock.block].image[0]*config.TEXTURE_SIZE,
              blockData[lastblock.block].image[1]*config.TEXTURE_SIZE,
              config.TEXTURE_SIZE,
              config.TEXTURE_SIZE,
              lastblock.startx+i*blocksize,
              renderoriginy+y*blocksize,
              blocksize,
              blocksize
            );
          }
        }
        lastblock={
          block:bl,
          count:1,
          startx:renderoriginx+x*blocksize
        };
      } else lastblock.count++;
      if (bl) {
        if (drawui&&x===selectedx&&y===selectedy) {
          if (keys[69]||mouse.down) block(idoriginx+x,idoriginy+y,front,currentblock==="_random_"||!blockData.hasOwnProperty(currentblock)?Object.keys(blockData)[Math.floor(Math.random()*Object.keys(blockData).length)]:currentblock);
          if (keys[81]) block(idoriginx+x,idoriginy+y,front,'void');
        }
      } else {
        ((tx,ty)=>{
          if (!~generatingChunks.indexOf(`${tx},${ty}`)) {
            generatingChunks.push(`${tx},${ty}`);
            setTimeout(()=>generateChunk(tx,ty),0);
          }
        })(Math.floor((idoriginx+x)/config.CHUNK_SIZE),Math.floor((idoriginy+y)/config.CHUNK_SIZE));
      }
    }
    if (lastblock.block) {
      if (blockData[lastblock.block].colour) {
        c.fillStyle=blockData[lastblock.block].colour;
        c.fillRect(lastblock.startx,renderoriginy+y*blocksize,blocksize*lastblock.count,blocksize);
      }
      if (blockData[lastblock.block].image) for (var i=0;i<lastblock.count;i++) {
        c.drawImage(
          textures,
          blockData[lastblock.block].image[0]*config.TEXTURE_SIZE,
          blockData[lastblock.block].image[1]*config.TEXTURE_SIZE,
          config.TEXTURE_SIZE,
          config.TEXTURE_SIZE,
          lastblock.startx+i*blocksize,
          renderoriginy+y*blocksize,
          blocksize,
          blocksize
        );
      }
    }
  }
  if (drawui) {
    c.fillStyle='#673AB7';
    c.fillRect(
      renderoriginx+(player.x/2-idoriginx)*blocksize,
      renderoriginy+(player.y/2-idoriginy)*blocksize,
      config.PLAYER.WIDTH*blocksize,
      config.PLAYER.HEIGHT*blocksize
    );
    c.drawImage(textures,config.CURSOR_TEXTURE_POS[0]*config.TEXTURE_SIZE,config.CURSOR_TEXTURE_POS[1]*config.TEXTURE_SIZE,config.TEXTURE_SIZE,config.TEXTURE_SIZE,renderoriginx+selectedx*blocksize,renderoriginy+selectedy*blocksize,blocksize,blocksize);
  }
}
function loop() {
  if (keys[65]) player.xv-=keys[16]?0.2:0.1;
  if (keys[87]) player.yv-=keys[16]?0.2:0.1;
  if (keys[68]) player.xv+=keys[16]?0.2:0.1;
  if (keys[83]) player.yv+=keys[16]?0.2:0.1;
  player.xv*=0.9;
  player.yv*=0.9;
  player.updateVelocities();
  player.updatePositions();
  scroll.x+=((player.x/2+config.PLAYER.WIDTH/2)*blocksize-scroll.x)/config.CAMERA_GLIDE_SPEED;
  scroll.y+=((player.y/2+config.PLAYER.HEIGHT/2)*blocksize-scroll.y)/config.CAMERA_GLIDE_SPEED;
  blocksize+=(scrollvel.zoom-blocksize)/5;
  c.clearRect(0,0,innerWidth,innerHeight);
  update(false);
  update(true);
  render(false); // background
  render(true,true); // foreground
  window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
