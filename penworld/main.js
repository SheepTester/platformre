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
  BLOCK_SIZE:16
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
  "undefined":{opacity:0},
  "null":{opacity:0},
  "air":{opacity:0},
  "grass":{colours:['#866247','#866247','#1F9D06','#866247','#866247','#866247'],opacity:1},
  "dirt":{colours:'#866247',opacity:1},
  "stone":{colours:'#919596',opacity:1},
  "sand":{colours:'#EED38B',opacity:1},
  "gravel":{colours:'#B8BCBD',opacity:1},
  "seawater":{colours:'rgba(105,210,231,0.8)',opacity:0},
  "water":{colours:'rgba(167,219,216,0.8)',opacity:0},
  "vapour":{colours:'rgba(255,255,255,0.5)',opacity:0}
};
function mod(a,b) {
  return (a%b+b)%b;
}
function generateChunk(chx,chy,chz) {
  var blocks=[];
  for (var i=0;i<config.CHUNK_SIZE*config.CHUNK_SIZE*config.CHUNK_SIZE;i++) blocks.push({type:"grass"});
  chunks[`${chx},${chy},${chz}`]=blocks;
}
function block(x,y,z,newblock) {
  var chunk=`${Math.floor(x/config.CHUNK_SIZE)},${Math.floor(y/config.CHUNK_SIZE)},${Math.floor(z/config.CHUNK_SIZE)}`;
  if (chunks[chunk]) {
    if (newblock) return chunks[chunk][(mod(z,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(y,config.CHUNK_SIZE))*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)]=newblock;
    else return chunks[chunk][(mod(z,config.CHUNK_SIZE)*config.CHUNK_SIZE+mod(y,config.CHUNK_SIZE))*config.CHUNK_SIZE+mod(x,config.CHUNK_SIZE)];
  }
  else return {};
}
function makeChunkFaces(chx,chy,chz) {
  var chunk=chunks[`${chx},${chy},${chz}`],
  faces=[];
  if (!chunk) return [];
  function opaqueLayer(oy) {
    var y=mod(oy,config.CHUNK_SIZE),
    chunk=chunks[`${chx},${chy+(oy-y)/config.CHUNK_SIZE},${chz}`]||[];
    for (var x=0;x<config.CHUNK_SIZE;x++) for (var z=0;z<config.CHUNK_SIZE;z++) {
      if (!blockData[(chunk[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]||{}).type].opacity) return false;
    }
    return true;
  }
  function opaqueXs(oz,oy) {
    var z=mod(oz,config.CHUNK_SIZE),
    y=mod(oy,config.CHUNK_SIZE),
    chunk=chunks[`${chx},${chy+(oy-y)/config.CHUNK_SIZE},${chz+(oz-z)/config.CHUNK_SIZE}`]||[];
    for (var x=0;x<config.CHUNK_SIZE;x++) {
      if (!blockData[(chunk[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]||{}).type].opacity) return false;
    }
    return true;
  }
  function opaqueZs(ox,oy) {
    var x=mod(ox,config.CHUNK_SIZE),
    y=mod(oy,config.CHUNK_SIZE),
    chunk=chunks[`${chx+(ox-x)/config.CHUNK_SIZE},${chy+(oy-y)/config.CHUNK_SIZE},${chz}`]||[];
    for (var z=0;z<config.CHUNK_SIZE;z++) {
      if (!blockData[(chunk[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]||{}).type].opacity) return false;
    }
    return true;
  }
  for (var y=0;y<config.CHUNK_SIZE;y++) {
    if (opaqueLayer(y)&&opaqueLayer(y-1)&&opaqueLayer(y+1)&&opaqueXs(z-1,y)&&opaqueXs(z+config.CHUNK_SIZE+1,y)&&opaqueZs(x-1,y)&&opaqueZs(x+config.CHUNK_SIZE+1,y)) {
      //
    } else {
      for (var x=0;x<config.CHUNK_SIZE;x++) for (var z=0;z<config.CHUNK_SIZE;z++) {
        var t=chunk[(z*config.CHUNK_SIZE+y)*config.CHUNK_SIZE+x]||{};
        if (blockData[t.type].opacity) {
          var coords=[(chx*config.CHUNK_SIZE+x)*config.BLOCK_SIZE,(chy*config.CHUNK_SIZE+y)*config.BLOCK_SIZE,(chz*config.CHUNK_SIZE+z)*config.BLOCK_SIZE],
          colours=blockData[t.type].colours;
          if (typeof colours==='string') colours=[colours,colours,colours,colours,colours,colours];
          if (!blockData[block(chx*config.CHUNK_SIZE+x-1,chy*config.CHUNK_SIZE+y,chz*config.CHUNK_SIZE+z).type].opacity)
            faces.push([colours[0],0,0,...coords,coords[1]+config.BLOCK_SIZE,coords[2]+config.BLOCK_SIZE]);
          if (!blockData[block(chx*config.CHUNK_SIZE+x+1,chy*config.CHUNK_SIZE+y,chz*config.CHUNK_SIZE+z).type].opacity)
            faces.push([colours[1],0,1,coords[0]+config.CHUNK_SIZE,coords[1],coords[2],coords[1]+config.BLOCK_SIZE,coords[2]+config.BLOCK_SIZE]);
          if (!blockData[block(chx*config.CHUNK_SIZE+x,chy*config.CHUNK_SIZE+y-1,chz*config.CHUNK_SIZE+z).type].opacity)
            faces.push([colours[2],1,1,...coords,coords[0]+config.BLOCK_SIZE,coords[2]+config.BLOCK_SIZE]);
          if (!blockData[block(chx*config.CHUNK_SIZE+x,chy*config.CHUNK_SIZE+y+1,chz*config.CHUNK_SIZE+z).type].opacity)
            faces.push([colours[3],1,0,coords[0],coords[1]+config.CHUNK_SIZE,coords[2],coords[0]+config.BLOCK_SIZE,coords[2]+config.BLOCK_SIZE]);
          if (!blockData[block(chx*config.CHUNK_SIZE+x,chy*config.CHUNK_SIZE+y,chz*config.CHUNK_SIZE+z-1).type].opacity)
            faces.push([colours[4],2,0,...coords,coords[0]+config.BLOCK_SIZE,coords[1]+config.BLOCK_SIZE]);
          if (!blockData[block(chx*config.CHUNK_SIZE+x,chy*config.CHUNK_SIZE+y,chz*config.CHUNK_SIZE+z+1).type].opacity)
            faces.push([colours[5],2,1,coords[0],coords[1],coords[2]+config.CHUNK_SIZE,coords[0]+config.BLOCK_SIZE,coords[1]+config.BLOCK_SIZE]);
        } else if (blockData[t.type].colours) {
          var coords=[(chx*config.CHUNK_SIZE+x)*config.BLOCK_SIZE,(chy*config.CHUNK_SIZE+y)*config.BLOCK_SIZE,(chz*config.CHUNK_SIZE+z)*config.BLOCK_SIZE],
          colours=blockData[t.type].colours;
          if (typeof colours==='string') colours=[colours,colours,colours,colours,colours,colours];
          faces.push([colours[0],0,0,...coords,coords[1]+config.BLOCK_SIZE,coords[2]+config.BLOCK_SIZE]);
          faces.push([colours[1],0,1,coords[0]+config.CHUNK_SIZE,coords[1],coords[2],coords[1]+config.BLOCK_SIZE,coords[2]+config.BLOCK_SIZE]);
          faces.push([colours[2],1,1,...coords,coords[0]+config.BLOCK_SIZE,coords[2]+config.BLOCK_SIZE]);
          faces.push([colours[3],1,0,coords[0],coords[1]+config.CHUNK_SIZE,coords[2],coords[0]+config.BLOCK_SIZE,coords[2]+config.BLOCK_SIZE]);
          faces.push([colours[4],2,0,...coords,coords[0]+config.BLOCK_SIZE,coords[1]+config.BLOCK_SIZE]);
          faces.push([colours[5],2,1,coords[0],coords[1],coords[2]+config.CHUNK_SIZE,coords[0]+config.BLOCK_SIZE,coords[1]+config.BLOCK_SIZE]);
        }
      }
    }
  }
  return faces;
}
generateChunk(0,0,0);
for (var i=2,blocks=Object.keys(blockData);i<blocks.length;i++) block(i-2,0,0,{type:blocks[i]});

/* MAKES THINGS HAPPEN */
var shapes=makeChunkFaces(0,0,0);
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
  var faces=[];
  for (var i=0;i<shapes.length;i++) {
    switch (shapes[i][1]) {
      case 0: // X stays the same
        faces.push(polygon(shapes[i][0],[
          pt(shapes[i][3],shapes[i][4],shapes[i][5]),
          pt(shapes[i][3],shapes[i][6],shapes[i][5]),
          pt(shapes[i][3],shapes[i][6],shapes[i][7]),
          pt(shapes[i][3],shapes[i][4],shapes[i][7])
        ],shapes[i][2]?'ccw':'cw'));
        break;
      case 1: // Y stays the same
        faces.push(polygon(shapes[i][0],[
          pt(shapes[i][3],shapes[i][4],shapes[i][5]),
          pt(shapes[i][6],shapes[i][4],shapes[i][5]),
          pt(shapes[i][6],shapes[i][4],shapes[i][7]),
          pt(shapes[i][3],shapes[i][4],shapes[i][7])
        ],shapes[i][2]?'ccw':'cw'));
        break;
      case 2: // Z stays the same
        faces.push(polygon(shapes[i][0],[
          pt(shapes[i][3],shapes[i][4],shapes[i][5]),
          pt(shapes[i][6],shapes[i][4],shapes[i][5]),
          pt(shapes[i][6],shapes[i][7],shapes[i][5]),
          pt(shapes[i][3],shapes[i][7],shapes[i][5])
        ],shapes[i][2]?'ccw':'cw'));
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
