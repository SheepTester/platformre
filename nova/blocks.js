var blockData={
  "":{
    "priority":0,
    "solid":false,
    "name":"Nothing",
    "colour":"transparent",
    "ignore":true
  },
  "TEMPLATE_GAS":{
    "priority":0,
    "solid":false,
    "name":"BILLY LA BUFANDAAAA",
    "colour":"yellow",
    "rotate":0,
    "ignore":true,
    "xGravity":0,
    "yGravity":0,
    "xDefaultVelocity":0,
    "yDefaultVelocity":0,
    "xMoveSpeed":0,
    "yMoveSpeed":0,
    "jumpVelocity":0,
    "xAirResist":1,
    "yAirResist":1
  },
  "TEMPLATE_LIQUID":{
    "priority":0,
    "solid":false,
    "name":"Y LAS BOTAAAASS",
    "colour":"blue",
    "rotate":0,
    "ignore":true,
    "xGravity":0,
    "yGravity":0,
    "xDefaultVelocity":0,
    "yDefaultVelocity":0,
    "xMoveSpeed":0.025,
    "yMoveSpeed":0.025,
    "lateralAccelerationAmplifier":0.5,
    "jumpVelocityAmplifier":0.5,
    "xAirResistAmplifier":0.95,
    "yAirResistAmplifier":0.95,
    "wallJumpVelocity":0
  },
  "air":{
    "priority":0,
    "extends":"TEMPLATE_GAS",
    "name":"Air",
    "colour":"white",
    "yGravity":0.0109,
  },
  "solid":{
    "priority":1,
    "solid":true,
    "name":"Generic solid",
    "colour":"#212121",
    "rotate":0,
    "lateralAcceleration":0.0375,
    "jumpVelocity":0.17,
    "friction":0.7,
    "wallBounciness":0.5,
    "wallJumpVelocity":0.1
  },
  "water":{
    "priority":1,
    "extends":"TEMPLATE_LIQUID",
    "name":"Dihydrogen monoxide",
    "colour":"#2196F3"
  },
  "gravity":{
    "priority":0,
    "extends":"TEMPLATE_GAS",
    "name":"Air with reversed gravity",
    "colour":"#64B5F6",
    "yGravity":-0.0109
  },
  "win":{
    "priority":2,
    "extends":"solid",
    "name":"Goal",
    "colour":"#8BC34A"
  },
  "lava":{
    "priority":1,
    "extends":"TEMPLATE_LIQUID",
    "name":"Generic killer (lava)",
    "colour":"#FF5722",
    "xAirResistAmplifier":0.8,
    "yAirResistAmplifier":0.8
  },
  "jumpboost":{
    "priority":2,
    "extends":"solid",
    "name":"Jump boost",
    "colour":"#9C27B0",
    "jumpVelocity":0.22
  },
  "mud":{
    "priority":0.5,
    "extends":"solid",
    "name":"Sanitary mud",
    "colour":"#795548",
    "lateralAcceleration":0.0125,
    "friction":0.5
  },
  "ice":{
    "priority":2,
    "extends":"solid",
    "name":"Solid water",
    "colour":"#00BCD4",
    "lateralAcceleration":0.0125,
    "friction":0.95
  },
  "sticky":{
    "priority":3,
    "extends":"solid",
    "name":"Sticky block",
    "colour":"#FFEB3B",
    "jumpVelocity":0
  },
  "leftconveyor":{
    "priority":1,
    "extends":"solid",
    "name":"Left accelerator",
    "colour":"#009688",
    "xDefaultVelocity":-0.075
  },
  "rightconveyor":{
    "priority":1,
    "extends":"solid",
    "name":"Right accelerator",
    "colour":"#004D40",
    "xDefaultVelocity":0.075
  },
  "text":{
    "priority":1,
    "extends":"solid",
    "name":"Label block",
    "colour":"#eee",
    "ontouch":function(data){
      return "say:"+atob(data.block.state);
    }
  }
};
function ridExtends(block) { // also color -> colour for Trump-like people
  if (blockData[block].extends) {
    ridExtends(blockData[block].extends);
    for (var prop in blockData[blockData[block].extends])
      if (prop!=='ignore'&&blockData[block][prop]===undefined&&blockData[blockData[block].extends][prop]!==undefined)
        blockData[block][prop]=blockData[blockData[block].extends][prop];
    delete blockData[block].extends;
  }
  if (blockData[block].color) {
    blockData[block].colour=blockData[block].color;
    delete blockData[block].color;
  }
}
for (var block in blockData) ridExtends(block);
/*{
  keys:KEYS,
  xpos:XPOS,
  ypos:YPOS,
  xvel:XVEL,
  yvel:YVEL,
  block:{
    name:BLOCK,
    state:BLOCKSTATE,
    rotation:ROTATION,
    x:BLOCKX,
    y:BLOCKY
  },
  powerup:{
    name:POWERUP,
    time:POWERUPTIME,
    range:POWERUPRANGE
  },
  triggerSource:TRIGGERSOURCE,
  contactSide:CONTACTSIDE,
  blockAt:GETBLOCKATXYFUNCTION
}*/
