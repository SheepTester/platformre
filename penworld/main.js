var config={
  VIEW_FACTOR:300,
  MIN_X:-240,
  MAX_X:240,
  MIN_Y:-180,
  MAX_Y:180,
  MIN_Z:10,
  MAX_Z:1000,
  MOVE_SPEED:0.5,
  CHUNK_SIZE:16,
  BLOCK_SIZE:16,
  CURRENT_BLOCK:'stone'
};

/* DOM (canvas, user input) */
var canvas=document.querySelector('#canvas'),
c=canvas.getContext('2d'),
keys={};
canvas.requestPointerLock=canvas.requestPointerLock||canvas.mozRequestPointerLock;
document.exitPointerLock=document.exitPointerLock||document.mozExitPointerLock;
function resize() {
  var pxr=SHEEP.pixelratio();
  canvas.width=innerWidth*pxr;
  canvas.height=innerHeight*pxr;
  c.scale(pxr,pxr);
  c.translate(innerWidth/2,innerHeight/2);
  config.MIN_X=-innerWidth/2;
  config.MAX_X=innerWidth/2;
  config.MIN_Y=-innerHeight/2;
  config.MAX_Y=innerHeight/2;
}
function lockChange(e) {
  if (document.pointerLockElement===canvas) keys.usingmouse=true;
  else keys.usingmouse=false;
}
document.addEventListener("keydown",e=>{
  keys[e.keyCode]=true;
  if (e.keyCode===27&&keys.usingmouse) {
    keys.usingmouse=false;
    document.exitPointerLock();
  }
  if (e.keyCode>=49&&e.keyCode<=57) SHEEP.notify(`Selected: ${config.CURRENT_BLOCK=Object.keys(blockData)[e.keyCode-46]}`,'#');
},false);
document.addEventListener("keyup",e=>{
  keys[e.keyCode]=false;
},false);
canvas.addEventListener("click",e=>{
  c.canvas.requestPointerLock();
},false);
if ("onpointerlockchange" in document) document.addEventListener('pointerlockchange',lockChange,false);
else if ("onmozpointerlockchange" in document) document.addEventListener('mozpointerlockchange',lockChange,false);
canvas.addEventListener("mousemove",e=>{
  if (keys.usingmouse) {
    camera.rotx.measure+=e.movementX/500;
    camera.roty.measure+=e.movementY/500;
  }
  e.preventDefault();
  return false;
},false);
canvas.addEventListener("mousedown",e=>{
  switch (e.which) {
    case 1:keys.left=true;break;
    case 2:keys.middle=true;break;
    case 3:keys.right=true;break;
    default: console.log(e.which);
  }
  e.preventDefault();
  return false;
},false);
canvas.addEventListener("mouseup",e=>{
  switch (e.which) {
    case 1:keys.left=false;break;
    case 2:keys.middle=false;break;
    case 3:keys.right=false;break;
  }
  e.preventDefault();
  return false;
},false);
window.addEventListener("resize",resize,false);
resize();

/* 3D */
var camera={
  x:0,y:0,z:-150,rotx:{measure:0},roty:{measure:0},
  xv:0,yv:0,zv:0,rotxv:0,rotyv:0
};
function pt(x,y,z) {
  return {x:x,y:y,z:z};
}
function cameraTransform(point) {
  var t={
    x:point.x-camera.x,y:point.y-camera.y,z:point.z-camera.z
  };
  x=t.x*camera.rotx.cos-t.z*camera.rotx.sin,
  z=t.z*camera.rotx.cos+t.x*camera.rotx.sin;
  y=t.y*camera.roty.cos-z*camera.roty.sin,
  z=z*camera.roty.cos+t.y*camera.roty.sin;
  return pt(x,y,z);
}
function xIntersect(p1,p2,x) {
  var percent=(x-p1[0])/(p2[0]-p1[0]);
  return [x,p1[1]+percent*(p2[1]-p1[1])];
}
function yIntersect(p1,p2,y) {
  var percent=(y-p1[1])/(p2[1]-p1[1]);
  return [p1[0]+percent*(p2[0]-p1[0]),y];
}
function zIntersect(p1,p2,planeZ) {
  var percent=(planeZ-p1.z)/(p2.z-p1.z);
  return pt(p1.x+percent*(p2.x-p1.x),p1.y+percent*(p2.y-p1.y),planeZ);
}
function flatify(point) {
  return [config.VIEW_FACTOR*(point.x/point.z),config.VIEW_FACTOR*(point.y/point.z)];
}
function clipShape(points,inRangeFn,intersectFn) {
  function toIndex(i) {
    var t=points.length;
    return (i%t+t)%t;
  }
  for (var i=0;i<points.length;i++) {
    if (inRangeFn(points[i])) {
      var currentPt=points[i];
      for (var lastPt=currentPt;points.length;) {
        var pt=points[toIndex(i-1)];
        if (inRangeFn(pt)) {
          lastPt=pt;
          points.splice(toIndex(i-1),1);
        } else {
          points.splice(toIndex(i),0,intersectFn(lastPt,pt));
          break;
        }
      }
      points.splice(i+1,1);
      for (var lastPt=currentPt;points.length;) {
        var pt=points[toIndex(i+1)];
        if (inRangeFn(pt)) {
          lastPt=pt;
          points.splice(toIndex(i+1),1);
        } else {
          points.splice(toIndex(i+1),0,intersectFn(lastPt,pt));
          break;
        }
      }
    }
  }
  return points;
}
function vertexDirection(points) {
  // https://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
  var sum=0;
  for (var i=0;i<points.length;i++) sum+=i===points.length-1?(points[0][0]-points[i][0])*(points[0][1]+points[i][1]):(points[i+1][0]-points[i][0])*(points[i+1][1]+points[i][1]);
  return sum;
}
function polygon(colour,vertices,clockwise) {
  var points=vertices.map(a=>cameraTransform(a)),
  z=points.map(a=>a.z).reduce((a,b)=>a+b)/points.length;
  points=clipShape(points,pt=>pt.z<config.MIN_Z,(pt1,pt2)=>zIntersect(pt1,pt2,config.MIN_Z));
  // points=clipShape(points,pt=>pt.z>config.MAX_Z,(pt1,pt2)=>zIntersect(pt1,pt2,config.MAX_Z));
  points=points.map(a=>flatify(a));
  if (clockwise&&(vertexDirection(points)<0)===(clockwise!=='cw')) return;
  points=clipShape(points,pt=>pt[0]<config.MIN_X,(pt1,pt2)=>xIntersect(pt1,pt2,config.MIN_X));
  points=clipShape(points,pt=>pt[0]>config.MAX_X,(pt1,pt2)=>xIntersect(pt1,pt2,config.MAX_X));
  points=clipShape(points,pt=>pt[1]<config.MIN_Y,(pt1,pt2)=>yIntersect(pt1,pt2,config.MIN_Y));
  points=clipShape(points,pt=>pt[1]>config.MAX_Y,(pt1,pt2)=>yIntersect(pt1,pt2,config.MAX_Y));
  if (points.length>2) {
    return [z,()=>{
      c.fillStyle=colour;
      c.beginPath();
      c.moveTo(points[0][0],points[0][1]);
      for (var i=1;i<points.length;i++) c.lineTo(points[i][0],points[i][1]);
      c.closePath();
      c.fill();
    }];
  }
  return null;
}

/* BLOCKS */
var chunks={},
chunkfaces={},
blockData={ // -X +X -Y +Y -Z +Z (left right top bottom front back)
  "undefined":{opaque:0,selectable:0},
  "null":{opaque:0,selectable:0},
  "air":{opaque:0,selectable:0},
  "grass":{colours:['#7f5d43','#7a5a41','#1b8805','#6e503a','#866247','#75563e'],opaque:1,selectable:1},
  "dirt":{colours:'#866247',opaque:1,selectable:1},
  "stone":{colours:['#86898a','#818485','#919596','#777a7a','#8b8e8f','#7c7f7f'],opaque:1,selectable:1},
  "sand":{colours:'#EED38B',opaque:1,selectable:1},
  "gravel":{colours:'#B8BCBD',opaque:1,selectable:1},
  "seawater":{colours:'rgba(105,210,231,0.8)',opaque:0,selectable:2},
  "water":{colours:'rgba(167,219,216,0.8)',opaque:0,selectable:2},
  "vapour":{colours:'rgba(255,255,255,0.5)',opaque:0,selectable:2},
  "smoke":{colours:'rgba(215,218,207,0.5)',opaque:0,selectable:2}
},
listOfBlocksWithShowingFacesThatYouShouldCheckOut=[];
listOfBlocksWithShowingFacesThatYouShouldCheckOut.faces={};
function mod(a,b) {
  return (a%b+b)%b;
}
function generateChunk(chx,chy,chz) {
  var blocks=[];
  for (var y=0;y<config.CHUNK_SIZE;y++) {
    if (y>11) for (var x=0;x<config.CHUNK_SIZE;x++) for (var z=0;z<config.CHUNK_SIZE;z++) blocks[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]={type:"stone"};
    else if (y>8) for (var x=0;x<config.CHUNK_SIZE;x++) for (var z=0;z<config.CHUNK_SIZE;z++) blocks[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]={type:"dirt"};
    else if (y===8) for (var x=0;x<config.CHUNK_SIZE;x++) for (var z=0;z<config.CHUNK_SIZE;z++) blocks[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]={type:"grass"};
    else for (var x=0;x<config.CHUNK_SIZE;x++) for (var z=0;z<config.CHUNK_SIZE;z++) blocks[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]={type:"air"};
  }
  chunks[`${chx},${chy},${chz}`]=blocks;
  for (var y=0;y<config.CHUNK_SIZE;y++) {
    if (generateChunk.opaqueLayer(chx,chy,chz,y)
        &&generateChunk.opaqueLayer(chx,chy,chz,y-1)
        &&generateChunk.opaqueLayer(chx,chy,chz,y+1)
        &&generateChunk.opaqueXs(chx,chy,chz,z-1,y)
        &&generateChunk.opaqueXs(chx,chy,chz,z+config.CHUNK_SIZE+1,y)
        &&generateChunk.opaqueZs(chx,chy,chz,x-1,y)
        &&generateChunk.opaqueZs(chx,chy,chz,x+config.CHUNK_SIZE+1,y));
    else {
      for (var x=0;x<config.CHUNK_SIZE;x++) for (var z=0;z<config.CHUNK_SIZE;z++) {
        updateBlockFaces(chx*config.CHUNK_SIZE+x,chy*config.CHUNK_SIZE+y,chz*config.CHUNK_SIZE+z);
      }
    }
  }
}
generateChunk.opaqueLayer=(chx,chy,chz,oy)=>{
  var y=mod(oy,config.CHUNK_SIZE),
  chunk=chunks[`${chx},${chy+(oy-y)/config.CHUNK_SIZE},${chz}`]||[];
  for (var x=0;x<config.CHUNK_SIZE;x++) for (var z=0;z<config.CHUNK_SIZE;z++) {
    if (!blockData[(chunk[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]||{}).type].opaque) return false;
  }
  return true;
}
generateChunk.opaqueXs=(chx,chy,chz,oz,oy)=>{
  var z=mod(oz,config.CHUNK_SIZE),
  y=mod(oy,config.CHUNK_SIZE),
  chunk=chunks[`${chx},${chy+(oy-y)/config.CHUNK_SIZE},${chz+(oz-z)/config.CHUNK_SIZE}`]||[];
  for (var x=0;x<config.CHUNK_SIZE;x++) {
    if (!blockData[(chunk[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]||{}).type].opaque) return false;
  }
  return true;
}
generateChunk.opaqueZs=(chx,chy,chz,ox,oy)=>{
  var x=mod(ox,config.CHUNK_SIZE),
  y=mod(oy,config.CHUNK_SIZE),
  chunk=chunks[`${chx+(ox-x)/config.CHUNK_SIZE},${chy+(oy-y)/config.CHUNK_SIZE},${chz}`]||[];
  for (var z=0;z<config.CHUNK_SIZE;z++) {
    if (!blockData[(chunk[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]||{}).type].opaque) return false;
  }
  return true;
}
function block(x,y,z,value,prop='type') {
  var chunk=`${Math.floor(x/config.CHUNK_SIZE)},${Math.floor(y/config.CHUNK_SIZE)},${Math.floor(z/config.CHUNK_SIZE)}`;
  if (chunks[chunk]) {
    if (value) {
      if (prop==='overwrite') return chunks[chunk][(mod(z,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(y,config.CHUNK_SIZE))*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)]=value;
      else return chunks[chunk][(mod(z,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(y,config.CHUNK_SIZE))*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)][prop]=value;
    }
    else return chunks[chunk][(mod(z,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(y,config.CHUNK_SIZE))*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)];
  }
  else return {};
}
function updateBlockFaces(x,y,z) {
  var bl=block(x,y,z).type,faces=[],
  colours=blockData[bl].colours;
  function makeObj(side,pos1,pos2) {
    return {
      colour:colours[side],
      ccw:(side+(side===2||side===3))%2,
      axis:(side/2)>>0,
      x:x*config.BLOCK_SIZE+(side===1&&config.BLOCK_SIZE),
      y:y*config.BLOCK_SIZE+(side===3&&config.BLOCK_SIZE),
      z:z*config.BLOCK_SIZE+(side===5&&config.BLOCK_SIZE),
      pos1:pos1*config.BLOCK_SIZE+config.BLOCK_SIZE,
      pos2:pos2*config.BLOCK_SIZE+config.BLOCK_SIZE
    };
  }
  if (typeof colours==='string') colours=[colours,colours,colours,colours,colours,colours];
  if (blockData[bl].opaque) {
    if (!blockData[block(x-1,y,z).type].opaque) faces.push(makeObj(0,y,z));
    if (!blockData[block(x+1,y,z).type].opaque) faces.push(makeObj(1,y,z));
    if (!blockData[block(x,y-1,z).type].opaque) faces.push(makeObj(2,x,z));
    if (!blockData[block(x,y+1,z).type].opaque) faces.push(makeObj(3,x,z));
    if (!blockData[block(x,y,z-1).type].opaque) faces.push(makeObj(4,x,y));
    if (!blockData[block(x,y,z+1).type].opaque) faces.push(makeObj(5,x,y));
  } else if (colours) {
    if (block(x-1,y,z).type!==bl) faces.push(makeObj(0,y,z));
    if (block(x+1,y,z).type!==bl) faces.push(makeObj(1,y,z));
    if (block(x,y-1,z).type!==bl) faces.push(makeObj(2,x,z));
    if (block(x,y+1,z).type!==bl) faces.push(makeObj(3,x,z));
    if (block(x,y,z-1).type!==bl) faces.push(makeObj(4,x,y));
    if (block(x,y,z+1).type!==bl) faces.push(makeObj(5,x,y));
  }
  block(x,y,z,faces,'faces');
  if (faces.length) {
    if (!~listOfBlocksWithShowingFacesThatYouShouldCheckOut.indexOf(`${x} ${y} ${z}`)) {
      listOfBlocksWithShowingFacesThatYouShouldCheckOut.push(`${x} ${y} ${z}`);
    }
    listOfBlocksWithShowingFacesThatYouShouldCheckOut.faces[`${x} ${y} ${z}`]=faces;
  } else {
    var t;
    if (~(t=listOfBlocksWithShowingFacesThatYouShouldCheckOut.indexOf(`${x} ${y} ${z}`))) {
      listOfBlocksWithShowingFacesThatYouShouldCheckOut.splice(t,1);
    }
  }
  return faces;
}
function sign(n) {
  return n>0?1:n<0?-1:0;
}
function rayCollides(origin,towards,isSolid,limit=7) {
  // origin, towards - points; they are expected to be <=1un from each other
  // need to scale coord system to 1 cube un per block
  var xdist=Math.abs(towards.x-origin.x),
  ydist=Math.abs(towards.y-origin.y)
  zdist=Math.abs(towards.z-origin.z),
  signx=sign(towards.x-origin.x),
  signy=sign(towards.y-origin.y),
  signz=sign(towards.z-origin.z),
  offsetx=signx>0?mod(origin.x,1):mod(-origin.x,1),
  offsety=signy>0?mod(origin.y,1):mod(-origin.y,1),
  offsetz=signz>0?mod(origin.z,1):mod(-origin.z,1),
  lastx=1,
  lasty=1,
  lastz=1,
  coords=[Math.floor(origin.x),Math.floor(origin.y),Math.floor(origin.z)];
  if (isSolid(...coords)) return [pt(...coords),null];
  for (var i=0;i<limit;i++) {
    while (i*xdist+offsetx>lastx) {
      coords=[Math.floor(lastx*signx+origin.x),Math.floor((lastx-offsetx)/xdist*ydist*signy+origin.y),Math.floor((lastx-offsetx)/xdist*zdist*signz+origin.z)];
      if (isSolid(...coords)) return [pt(...coords),signx===1?0:signx===-1?1:null];
      lastx++;
    }
    while (i*ydist+offsety>lasty) {
      coords=[Math.floor((lasty-offsety)/ydist*xdist*signx+origin.x),Math.floor(lasty*signy+origin.y),Math.floor((lasty-offsety)/ydist*zdist*signz+origin.z)];
      if (isSolid(...coords)) return [pt(...coords),signy===1?2:signy===-1?3:null];
      lasty++;
    }
    while (i*zdist+offsetz>lastz) {
      coords=[Math.floor((lastz-offsetz)/zdist*ydist*signx+origin.x),Math.floor((lastz-offsetz)/zdist*ydist*signy+origin.y),Math.floor(lastz*signz+origin.z)];
      if (isSolid(...coords)) return [pt(...coords),signz===1?4:signz===-1?5:null];
      lastz++;
    }
  }
  return [null,null];
}
generateChunk(0,0,0);
for (var i=2,blocks=Object.keys(blockData);i<blocks.length;i++) {
  block(i-2,0,0,blocks[i]);
  updateBlockFaces(i-2,0,0);
  updateBlockFaces(i-3,0,0);
  updateBlockFaces(i-1,0,0);
  updateBlockFaces(i-2,-1,0);
  updateBlockFaces(i-2,1,0);
  updateBlockFaces(i-2,0,-1);
  updateBlockFaces(i-2,0,1);
}

/* MAKES THINGS HAPPEN */
function draw() {
  c.clearRect(-innerWidth/2,-innerHeight/2,innerWidth,innerHeight);
  camera.x+=camera.xv,camera.xv*=0.9;
  camera.y+=camera.yv,camera.yv*=0.9;
  camera.z+=camera.zv,camera.zv*=0.9;
  // camera.rotx.measure+=camera.rotxv,camera.rotxv*=0.9;
  // camera.roty.measure+=camera.rotyv,camera.rotyv*=0.9;
  camera.rotx.sin=Math.sin(camera.rotx.measure),camera.rotx.cos=Math.cos(camera.rotx.measure);
  camera.roty.sin=Math.sin(camera.roty.measure),camera.roty.cos=Math.cos(camera.roty.measure);
  if (keys[87]) camera.xv+=camera.rotx.sin*config.MOVE_SPEED,camera.zv+=camera.rotx.cos*config.MOVE_SPEED;
  if (keys[83]) camera.xv-=camera.rotx.sin*config.MOVE_SPEED,camera.zv-=camera.rotx.cos*config.MOVE_SPEED;
  if (keys[65]) camera.xv-=camera.rotx.cos*config.MOVE_SPEED,camera.zv+=camera.rotx.sin*config.MOVE_SPEED;
  if (keys[68]) camera.xv+=camera.rotx.cos*config.MOVE_SPEED,camera.zv-=camera.rotx.sin*config.MOVE_SPEED;
  if (keys[16]) camera.yv+=config.MOVE_SPEED;
  if (keys[32]) camera.yv-=config.MOVE_SPEED;
  var startpt=pt(camera.x/config.BLOCK_SIZE,camera.y/config.BLOCK_SIZE,camera.z/config.BLOCK_SIZE); // /config.BLOCK_SIZE to scale to 1un coordinate system thing
  var z=(camera.roty.cos*config.BLOCK_SIZE)/(camera.roty.sin*camera.roty.sin+camera.roty.cos*camera.roty.cos),
  y=(camera.roty.sin*z)/camera.roty.cos,
  x;
  z=(camera.rotx.cos*z)/(camera.rotx.sin*camera.rotx.sin+camera.rotx.cos*camera.rotx.cos),
  x=(camera.rotx.sin*z)/camera.rotx.cos;
  var raypt=pt((x+camera.x)/config.BLOCK_SIZE,(y+camera.y)/config.BLOCK_SIZE,(z+camera.z)/config.BLOCK_SIZE);
  var selected=rayCollides(startpt,raypt,(x,y,z)=>{
    return blockData[block(x,y,z).type].selectable;
  },7),face;
  [selected,face]=selected;
  if (selected) {
    if (keys.left||keys[81]) {
      block(selected.x,selected.y,selected.z,'air');
      updateBlockFaces(selected.x,selected.y,selected.z);
      updateBlockFaces(selected.x-1,selected.y,selected.z);
      updateBlockFaces(selected.x+1,selected.y,selected.z);
      updateBlockFaces(selected.x,selected.y-1,selected.z);
      updateBlockFaces(selected.x,selected.y+1,selected.z);
      updateBlockFaces(selected.x,selected.y,selected.z-1);
      updateBlockFaces(selected.x,selected.y,selected.z+1);
    }
    if (face!==null&&(keys.right||keys[69])) {
      var offset={
        x:face===0?-1:face===1?1:0,
        y:face===2?-1:face===3?1:0,
        z:face===4?-1:face===5?1:0
      };
      // Object.keys(blockData)[Math.floor(Math.random()*(Object.keys(blockData)-3)+3)]
      block(selected.x+offset.x,selected.y+offset.y,selected.z+offset.z,config.CURRENT_BLOCK);
      updateBlockFaces(selected.x+offset.x,selected.y+offset.y,selected.z+offset.z);
      updateBlockFaces(selected.x+offset.x-1,selected.y+offset.y,selected.z+offset.z);
      updateBlockFaces(selected.x+offset.x+1,selected.y+offset.y,selected.z+offset.z);
      updateBlockFaces(selected.x+offset.x,selected.y+offset.y-1,selected.z+offset.z);
      updateBlockFaces(selected.x+offset.x,selected.y+offset.y+1,selected.z+offset.z);
      updateBlockFaces(selected.x+offset.x,selected.y+offset.y,selected.z+offset.z-1);
      updateBlockFaces(selected.x+offset.x,selected.y+offset.y,selected.z+offset.z+1);
    }
  }
  /*c.fillStyle='#866247';
  polygon([pt(-50,-50,50),pt(50,-50,50),pt(50,50,50),pt(-50,50,50)],'ccw');
  polygon([pt(-50,-50,-50),pt(50,-50,-50),pt(50,50,-50),pt(-50,50,-50)],'cw');
  polygon([pt(50,-50,-50),pt(50,-50,50),pt(50,50,50),pt(50,50,-50)],'cw');
  polygon([pt(-50,-50,-50),pt(-50,-50,50),pt(-50,50,50),pt(-50,50,-50)],'ccw');
  polygon([pt(-50,50,-50),pt(50,50,-50),pt(50,50,50),pt(-50,50,50)],'cw');
  c.fillStyle='#1F9D06';
  polygon([pt(-50,-50,-50),pt(50,-50,-50),pt(50,-50,50),pt(-50,-50,50)],'ccw');
  polygon([pt(-50,-50,50),pt(50,-50,50),pt(50,-40,50),pt(-50,-40,50)],'ccw');
  polygon([pt(-50,-50,-50),pt(50,-50,-50),pt(50,-40,-50),pt(-50,-40,-50)],'cw');
  polygon([pt(50,-50,-50),pt(50,-50,50),pt(50,-40,50),pt(50,-40,-50)],'cw');
  polygon([pt(-50,-50,-50),pt(-50,-50,50),pt(-50,-40,50),pt(-50,-40,-50)],'ccw');*/
  var faces=[],
  shapes=[];
  for (var i=0;i<listOfBlocksWithShowingFacesThatYouShouldCheckOut.length;i++)
    shapes.push(...listOfBlocksWithShowingFacesThatYouShouldCheckOut.faces[listOfBlocksWithShowingFacesThatYouShouldCheckOut[i]]);
  if (keys[13]) console.log(shapes);
  for (var i=0;i<shapes.length;i++) {
    switch (shapes[i].axis) {
      case 0: // X stays the same
        faces.push(polygon(shapes[i].colour,[
          pt(shapes[i].x,shapes[i].y,shapes[i].z),
          pt(shapes[i].x,shapes[i].pos1,shapes[i].z),
          pt(shapes[i].x,shapes[i].pos1,shapes[i].pos2),
          pt(shapes[i].x,shapes[i].y,shapes[i].pos2)
        ],shapes[i].ccw?'ccw':'cw'));
        break;
      case 1: // Y stays the same
        faces.push(polygon(shapes[i].colour,[
          pt(shapes[i].x,shapes[i].y,shapes[i].z),
          pt(shapes[i].pos1,shapes[i].y,shapes[i].z),
          pt(shapes[i].pos1,shapes[i].y,shapes[i].pos2),
          pt(shapes[i].x,shapes[i].y,shapes[i].pos2)
        ],shapes[i].ccw?'ccw':'cw'));
        break;
      case 2: // Z stays the same
        faces.push(polygon(shapes[i].colour,[
          pt(shapes[i].x,shapes[i].y,shapes[i].z),
          pt(shapes[i].pos1,shapes[i].y,shapes[i].z),
          pt(shapes[i].pos1,shapes[i].pos2,shapes[i].z),
          pt(shapes[i].x,shapes[i].pos2,shapes[i].z)
        ],shapes[i].ccw?'ccw':'cw'));
        break;
    }
  }
  faces=faces.filter(a=>a).sort((a,b)=>b[0]-a[0]);
  for (var i=0;i<faces.length;i++) {
    faces[i][1]();
  }
  window.requestAnimationFrame(draw);
}
draw();
