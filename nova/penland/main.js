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
  SEA_LEVEL:10
},random=new Random(45345);
var chunks={},
heights={},
blocksize=16,
scroll={x:0,y:0},
canvas=document.querySelector('#canvas'),
c=canvas.getContext('2d'),
textures=document.querySelector('#textures'),
keys={},
mouse={down:false,x:0,y:0};
var blockData={
  air:{colour:"#CEECFF"},
  dirt:{colour:"#866247"},
  grass:{colour:"#866247",image:[1,0]},
  stone:{colour:"#919596"},
  oaktrunk:{colour:"#74674F"},
  oaktreaves:{colour:"#719C34"},
  oakleaves:{colour:"#82B53C"},
  rose:{colour:"#CEECFF",image:[2,0]},
  goldenrod:{colour:"#CEECFF",image:[3,0]},
  myosotis:{colour:"#CEECFF",image:[4,0]},
  sand:{colour:"#EED38B"},
  palmtrunk:{colour:"#D1BE94"},
  palmtreaves:{colour:"#87BB25"},
  palmleaves:{colour:"#99D42A"},
  tallgrass:{colour:"#CEECFF",image:[5,0]},
  vapour:{colour:"#FFFFFF"},
  seawater:{colour:"#69D2E7"},
  water:{colour:"#A7DBD8"},
  pinetrunk:{colour:"#4E342E"},
  pinetreaves:{colour:"#304D07"},
  pineleaves:{colour:"#406609"},
  autumntrunk:{colour:"#9E715C"},
  autumntreaves1:{colour:"#D7AC56"},
  autumnleaves1:{colour:"#F0C060"},
  autumntreaves2:{colour:"#D78241"},
  autumnleaves2:{colour:"#F09048"},
  autumntreaves3:{colour:"#C0412A"},
  autumnleaves3:{colour:"#D84830"},
  gravel:{colour:"#B8BCBD"}
},
scrollvel={x:0,y:0};
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
function generateHeight(chunkx) {
  var heightchunkx=Math.floor(chunkx/config.HEIGHT_MAP_SIZE)*config.HEIGHT_MAP_SIZE,
  randomness=20,
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
  height=heights[chx]||generateHeight(chx);
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
  selectedy=Math.floor((mouse.y-renderoriginy)/blocksize);
  for (var x=0;x<stopx;x++) {
    for (var y=0;y<stopy;y++) {
      var bl=block(idoriginx+x,idoriginy+y),args;
      if (bl) {
        if (x===selectedx&&y===selectedy) {
          var args=[renderoriginx+(x+0.1)*blocksize,renderoriginy+(y+0.1)*blocksize,blocksize*0.8,blocksize*0.8];
          if (mouse.down) block(idoriginx+x,idoriginy+y,'stone');
        } else {
          args=[renderoriginx+x*blocksize,renderoriginy+y*blocksize,blocksize,blocksize];
        }
        if (blockData[bl].colour) {
          c.fillStyle=blockData[bl].colour;
          c.fillRect(...args);
        }
        if (blockData[bl].image)
          c.drawImage(textures,blockData[bl].image[0]*config.TEXTURE_SIZE,blockData[bl].image[1]*config.TEXTURE_SIZE,config.TEXTURE_SIZE,config.TEXTURE_SIZE,...args);
      } else {
        generateChunk(Math.floor((idoriginx+x)/config.CHUNK_SIZE),Math.floor((idoriginy+y)/config.CHUNK_SIZE));
      }
    }
  }
}
function loop() {
  if (keys[37]) scrollvel.x-=1;
  if (keys[38]) scrollvel.y-=1;
  if (keys[39]) scrollvel.x+=1;
  if (keys[40]) scrollvel.y+=1;
  scrollvel.x*=0.9;
  scrollvel.y*=0.9;
  scroll.x+=scrollvel.x;
  scroll.y+=scrollvel.y;
  render();
  window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);