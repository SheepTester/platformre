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
  CAMERA_GLIDE_SPEED:3
};
var chunks={},
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
      return bl.collision[(y%2)*2+x%2];
    }
    else return bl.solid;
  }
  else return false;
});
var blockData={
  air:{colour:"#CEECFF",solid:0},
  dirt:{colour:"#866247",solid:1},
  grass:{colour:"#866247",image:[1,0],solid:1},
  stone:{colour:"#919596",solid:1},
  oaktrunk:{colour:"#74674F",solid:0},
  oaktreaves:{colour:"#719C34",solid:0},
  oakleaves:{colour:"#82B53C",solid:0},
  rose:{colour:"#CEECFF",image:[2,0],solid:0},
  goldenrod:{colour:"#CEECFF",image:[3,0],solid:0},
  myosotis:{colour:"#CEECFF",image:[4,0],solid:0},
  sand:{colour:"#EED38B",solid:1},
  palmtrunk:{colour:"#D1BE94",solid:0},
  palmtreaves:{colour:"#87BB25",solid:0},
  palmleaves:{colour:"#99D42A",solid:0},
  tallgrass:{colour:"#CEECFF",image:[5,0],solid:0},
  vapour:{colour:"#FFFFFF",solid:0},
  seawater:{colour:"#69D2E7",solid:0},
  water:{colour:"#A7DBD8",solid:0},
  pinetrunk:{colour:"#4E342E",solid:0},
  pinetreaves:{colour:"#304D07",solid:0},
  pineleaves:{colour:"#406609",solid:0},
  autumntrunk:{colour:"#9E715C",solid:0},
  autumntreaves1:{colour:"#D7AC56",solid:0},
  autumnleaves1:{colour:"#F0C060",solid:0},
  autumntreaves2:{colour:"#D78241",solid:0},
  autumnleaves2:{colour:"#F09048",solid:0},
  autumntreaves3:{colour:"#C0412A",solid:0},
  autumnleaves3:{colour:"#D84830",solid:0},
  gravel:{colour:"#B8BCBD",solid:1}
},
scrollvel={x:0,y:0,zoom:blocksize},
generatingChunks=[];
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
  height=heights[chx]||generateHeight(chx),
  random=new Random(chx*chy*config.SEED);
  for (var y=0;y<config.CHUNK_SIZE;y++) {
    for (var x=0;x<config.CHUNK_SIZE;x++) {
      var h=y+chy*config.CHUNK_SIZE;
      if (height[x]<config.SEA_LEVEL) {
        if (h<height[x]-1) blocks.push('air');
        else if (h===height[x]-1) {
          switch (Math.floor(random.nextFloat()*10)) {
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
            default:
              blocks.push('air');
          }
        }
        else if (h===height[x]) blocks.push('grass');
        else if (h<height[x]+Math.floor(random.nextFloat()*5+3)) blocks.push('dirt');
        else blocks.push('stone');
      } else {
        if (h<config.SEA_LEVEL) blocks.push('air');
        else if (h<height[x]) blocks.push('seawater');
        else if (h<height[x]+Math.floor(random.nextFloat()*5+3)) {
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
        else blocks.push('stone');
      }
    }
  }
  chunks[`${chx},${chy}`]=blocks;
}
function block(x,y,newblock) {
  var chunk=`${Math.floor(x/config.CHUNK_SIZE)},${Math.floor(y/config.CHUNK_SIZE)}`;
  if (chunks[chunk]) {
    if (newblock) return chunks[chunk][mod(y,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)]=newblock;
    else return chunks[chunk][mod(y,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)];
  }
  else return null;
}
generateChunk(0,0);
function render() {
  c.clearRect(0,0,innerWidth,innerHeight);
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
      var bl=block(idoriginx+x,idoriginy+y);
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
        if (x===selectedx&&y===selectedy) {
          if (mouse.down) block(idoriginx+x,idoriginy+y,'water');
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
  c.fillStyle='#673AB7';
  c.fillRect(
    renderoriginx+(player.x/2-idoriginx)*blocksize,
    renderoriginy+(player.y/2-idoriginy)*blocksize,
    config.PLAYER.WIDTH*blocksize,
    config.PLAYER.HEIGHT*blocksize
  );
  c.drawImage(textures,config.CURSOR_TEXTURE_POS[0]*config.TEXTURE_SIZE,config.CURSOR_TEXTURE_POS[1]*config.TEXTURE_SIZE,config.TEXTURE_SIZE,config.TEXTURE_SIZE,renderoriginx+selectedx*blocksize,renderoriginy+selectedy*blocksize,blocksize,blocksize);
}
function loop() {
  if (keys[37]) player.xv-=0.1;
  if (keys[38]) player.yv-=0.1;
  if (keys[39]) player.xv+=0.1;
  if (keys[40]) player.yv+=0.1;
  player.xv*=0.9;
  player.yv*=0.9;
  player.updateVelocities();
  player.updatePositions();
  scroll.x+=((player.x/2+config.PLAYER.WIDTH/2)*blocksize-scroll.x)/config.CAMERA_GLIDE_SPEED;
  scroll.y+=((player.y/2+config.PLAYER.HEIGHT/2)*blocksize-scroll.y)/config.CAMERA_GLIDE_SPEED;
  blocksize+=(scrollvel.zoom-blocksize)/5;
  render();
  window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
