var levels=[[],[["Congrats! The time is posted in the Javascript console."],"`g`","g g","`0`",]];
if(!localStorage.getItem('level')) {
  localStorage.setItem('level',JSON.stringify([[],
    "@@@@@@@@@@@@@@@@@+@@",
    "@              @@w@@",
    "@               www@",
    "@   @===@       www@",
    "@     #         www@",
    "@     #        @w@@@",
    "@v^@@###*>><<**@@@@@",
  ]));
}
levels[0]=JSON.parse(localStorage.getItem('level'));
function startPlaying() {
  lev=0;
  render(0);
  xv=0,yv=0,x=40,y=40;
  window.scrollTo(0,document.body.scrollHeight);
  if (pausd) {
    pausd=false;
    wow=setInterval(play,33);
  }
  time=Date.now();
}
function render(level) {
  var blockClasses=["ground","lava","win","jump topOnly","mud topOnly","nojump topOnly","ice","water","left topOnly","right topOnly","check topOnly","fanL","fanR","fanB","ajump topOnly","gold","sand","antilava topOnly","nopower","liquify topOnly","pillar topOnly","fire","ladder","slam topOnly","rage topOnly","midas topOnly","trans topOnly","sl","sa","ls","la","grav"],
  ids="@#+^=v*w<>CLRB&gsa`ipfe;omtýáéíy",
  data="<div id='player'></div>",level;
  if (level===undefined) {
    level=lev;
  }
  for (var i=1;i<levels[level].length;i++) {
    for (var j=0;j<levels[level][i].length;j++) {
      var id=ids.indexOf(levels[level][i][j]);
      if (id!==-1) id=blockClasses[id];
      else if (/[0-9]/.test(levels[level][i][j])) id="text topOnly";
      else if (!" .óú".split('').includes(levels[level][i][j])) id="glitch";
      if (id!==-1) {
        data+="<div class='levelBlock "+id+"' style='top:"+(i*40-40)+"px;left:"+(j*40)+"px;'></div>";
      }
    }
  }
  document.querySelector(".level").innerHTML=data;
  document.querySelector(".level").style.height=(levels[level].length*40-40)+"px";
}
var wDown=false,aDown=false,dDown=false,sDown=false,pausd=true,spaceDown=false;
document.body.onkeydown=function(e){
  switch (e.keyCode) {
    case 87:
      wDown=true;
      break;
    case 65:
      aDown=true;
      break;
    case 83:
      sDown=true;
      break;
    case 68:
      dDown=true;
      break;
    case 32:
      spaceDown=true;
      if (e.target==document.body) {
        e.preventDefault();
        return false;
      }
      break;
    case 82:
      die();
      break;
    case 80:
      if (pausd) wow=setInterval(play,33);
      else {
        clearInterval(wow);
        document.querySelector("#message").textContent="Paused";
        document.querySelector("#message").style.display="block";
      }
      pausd=!pausd;
      break;
  }
};
document.body.onkeyup=function(e){
  switch (e.keyCode) {
    case 87:
      wDown=false;
      break;
    case 65:
      aDown=false;
      break;
    case 83:
      sDown=false;
      break;
    case 68:
      dDown=false;
      break;
    case 32:
      spaceDown=false;
      break;
  }
};
/* plattformre script based off those from Scratch */
var xv=0,yv=0,x=40,y=40,lev=0,cpx=40,cpy=40,collide="@^v*=<>0123456789CLRB&gsa`ip;omtýá".split(''),danger="#éí",power="",powerupdelay=-1,v,time,play=function(){
  x+=xv;y+=yv;
  if (power) { /* powerups */
    var anyChanges=false,tt;
    switch (power) {
      case "antilava":
        for (var i=0;i<9;i++) {
          tt=getBlock(i%3*40-40,Math.floor(i/3)*40-40);
          if (danger.includes(tt)) {
            setBlock(i%3*40-40,Math.floor(i/3)*40-40,"@");
            anyChanges=true;
          }
          if (tt=="f") {
            setBlock(i%3*40-40,Math.floor(i/3)*40-40," ");
            anyChanges=true;
          }
        }
        break;
      case "liquify":
        for (var i=0;i<9;i++) {
          tt=getBlock(i%3*40-40,Math.floor(i/3)*40-40);
          if (tt=="@") {
            setBlock(i%3*40-40,Math.floor(i/3)*40-40,"*");
            anyChanges=true;
          } else if (danger.includes(tt)) {
            setBlock(i%3*40-40,Math.floor(i/3)*40-40,"`");
            anyChanges=true;
          } else if (!collide.includes(tt)||tt=="f") {
            setBlock(i%3*40-40,Math.floor(i/3)*40-40,"w");
            anyChanges=true;
          }
        }
        break;
      case "pillar":
        for (var i=0;i<9;i++) {
          tt=getBlock(i%3*40-40,Math.floor(i/3)*40-40);
          if (i==1) {
            if (tt!="@"){
              setBlock(i%3*40-40,Math.floor(i/3)*40-40,"@");
              anyChanges=true;
            }
          } else if (collide.includes(tt)&&tt!="@") {
            setBlock(i%3*40-40,Math.floor(i/3)*40-40," ");
            anyChanges=true;
          }
        }
        if (anyChanges) {
          cpx=x;
          cpy=y;
        };
        break;
      case "slam":
        if (sDown&&getBlock(0,-40)!=" ") {
          var tt=getBlock(0,-40),order="g@`=s &^*w #f ".split('');
          if (order.indexOf(tt)>-1) {
            setBlock(0,-40,order[order.indexOf(tt)+1]);
            anyChanges=true;
          }
        }
        break;
      case "midas":
        for (var i=0;i<9;i++) {
          tt=getBlock(i%3*40-40,Math.floor(i/3)*40-40);
          if (collide.includes(tt)&&tt!="g") {
            setBlock(i%3*40-40,Math.floor(i/3)*40-40,"g");
            anyChanges=true;
          }
        }
        break;
    }
    if (anyChanges) render();
  }
  var onALadder=[getBlock(-10,-10),getBlock(10,-10),getBlock(-10,10),getBlock(10,10)].includes("e"),
  collidingWithWall=collide.includes(getBlock(-15,0))||collide.includes(getBlock(14,0));
  if (getBlock(0,0)=="f"&&power!="rage") die();
  else if (onALadder) {
    yv=0;
    if (wDown&&!sDown) y+=5;
    else if (!wDown&&sDown) y-=5;
  }
  var water,
  powerupPadId="aip;ot".split(''),
  powerupName=["antilava","liquify","pillar","slam","rage","trans"],
  powerupLength=[5,2,1,5,3,3],
  reverseGrav=[getBlock(-10,-10),getBlock(10,-10),getBlock(-10,10),getBlock(10,10)].includes("y");
  if (collidingWithWall?collide.includes(getBlock(0,-16)):collide.includes(getBlock(-10,-16))||collide.includes(getBlock(10,-16))) {
    yv=0;
    y=Math.ceil((y-5)/40)*40;
  }
  if (onALadder) { /* ladder */
    water="climbing";
    if (spaceDown) xv=Math.round(xv*300)/1000;
    else if (aDown&&!dDown&&xv>-10) xv-=1.5;
    else if (dDown&&!aDown&&xv<10) xv+=1.5;
    else xv=Math.round(xv*700)/1000;
  }
  else if ([getBlock(-10,-10),getBlock(10,-10),getBlock(-10,10),getBlock(10,10)].includes("w")) { /* swimming */
    water="swimming";
    if (spaceDown) {
      xv=Math.round(xv*800)/1000;
      yv=Math.round(yv*800)/1000;
    } else {
      xv=Math.round(xv*950)/1000;
      yv=Math.round(yv*950)/1000;
      if(wDown)yv+=1;
      if(aDown)xv-=1;
      if(sDown)yv-=1;
      if(dDown)xv+=1;
    }
  } else if (!(collide.includes(getBlock(-10,-16))||collide.includes(getBlock(10,-16)))&&!reverseGrav) { /* falling */
    yv-=1;
    water="falling";
  } else if (reverseGrav&&!(collide.includes(getBlock(-10,15))||collide.includes(getBlock(10,15)))) {
    yv+=1;
    water="fallingup";
  }
  if (danger.includes(getBlock(0,-16))&&power!="rage") die(); /* topOnly block interactions */
  else if (getBlock(0,-16)=="+") die("win");
  else if (getBlock(0,-16)=="<") xv-=3;
  else if (getBlock(0,-16)==">") xv+=3;
  else if (getBlock(0,-16)=="&") yv=20;
  else if (getBlock(0,-16)=="C") {
    cpx=x;
    cpy=y;
    setBlock(0,-16,"`");
    render();
  }
  else if (getBlock(0,-16)=="m") {
    power="midas";
    clearTimeout(powerupdelay);
    powerupdelay=setTimeout(function(){
      power='';
    },3000);
    setBlock(0,-16,"`");
    render();
  }
  else if (powerupPadId.includes(getBlock(0,-16))&&spaceDown) {
    var powerupId=powerupPadId.indexOf(getBlock(0,-16));
    power=powerupName[powerupId];
    clearTimeout(powerupdelay);
    powerupdelay=setTimeout(function(){
      power='';
    },powerupLength[powerupId]*1000);
    setBlock(0,-16,"`");
    render();
  }
  if (/[0-9]/.test(getBlock(0,-16))) { /* display text */
    if (levels[lev][0][Number(getBlock(0,-16))]!==undefined) {
      document.querySelector("#message").textContent=levels[lev][0][Number(getBlock(0,-16))];
      document.querySelector("#message").style.display="block";
    }
  } else if (power) {
    document.querySelector("#message").textContent={antilava:"Lava to solid",liquify:"Liquidification",pillar:"Pillar",slam:"Slammer",rage:"Rage/boss",midas:"Midas' Touch",trans:"Transparent blocks"}[power]+" powerup active";
    document.querySelector("#message").style.display="block";
  }
  else if (document.querySelector("#message").style.display=="block") document.querySelector("#message").style.display="none";
  var amIAboveAFan=(getBlock(0,-40)=="B"||getBlock(0,-80)=="B")&&water=="falling";
  if ((amIAboveAFan||water===undefined)) { /* MOVING */
    if (wDown&&!amIAboveAFan&&!reverseGrav) {
      if (power=="rage") yv=30;
      else if (getBlock(0,-16)=="^") yv=20;
      else if (getBlock(0,-16)!="v") yv=15;
    }
    if (reverseGrav) {
      if (sDown) {
        if (power=="rage") yv=-30;
        else yv=-15;
      }
    }
    var tempp;
    if (power=="rage") tempp=20;
    else if (getBlock(0,-16)=="=") tempp=5;
    else if (getBlock(0,-16)=="*"||amIAboveAFan) tempp=15;
    else tempp=10;
    if (spaceDown&&(collide.includes(getBlock(0,-16))||reverseGrav&&collide.includes(getBlock(0,15)))) {
      if (tempp==15) xv=Math.round(xv*700)/1000;
      else xv=Math.round(xv*300)/1000;
    } else {
      if (aDown&&!dDown&&xv>-tempp) {
        if (tempp==5) xv-=0.5;
        else if (tempp==15) xv-=0.5;
        else if (tempp==20) xv-=3;
        else xv-=1.5;
      } else if (dDown&&!aDown&&xv<tempp) {
        if (tempp==5) xv+=0.5;
        else if (tempp==15) xv+=0.5;
        else if (tempp==20) xv+=3;
        else xv+=1.5;
      } else {
        if (tempp==5) xv=Math.round(xv*500)/1000;
        else if (tempp==15) xv=Math.round(xv*950)/1000;
        else if (tempp!=20) xv=Math.round(xv*700)/1000;
      }
    }
    if (Math.abs(xv)<0.01) {
      xv=0;
      x=Math.round(x*1000)/1000;
    }
    if (power=="trans"&&sDown) y-=71;
  }
  if (danger.includes(getBlock(0,15))&&power!="rage") die(); /* ceiling */
  else if (getBlock(0,15)=="+") die("win");
  else if (collidingWithWall?collide.includes(getBlock(0,15)):collide.includes(getBlock(-10,15))||collide.includes(getBlock(10,15))) {
    if (getBlock(0,0)!="w"&&!reverseGrav) yv=-1;
    y=Math.floor((y-5)/40)*40+10;
    if (power=="trans"&&!collide.includes(getBlock(0,71))) y+=71;
  }
  if (danger.includes(getBlock(-15,0))&&power!="rage") die(); /* left wall */
  else if (getBlock(-15,0)=="+") die("win");
  else if (collide.includes(getBlock(-15,0))) {
    x=Math.ceil((x-5)/40)*40;
    if ((aDown||dDown)&&Math.abs(xv*100)>1) {
      if (wDown&&getBlock(0,0)!="w"&&!onALadder&&!reverseGrav) {
        yv=10;
        xv*=-1;
      } else if (sDown&&getBlock(0,0)!="w"&&!onALadder&&reverseGrav) {
        yv=-10;
        xv*=-1;
      }
      else xv*=-0.5;
    }
    else xv=0;
    if (power=="trans"&&!collide.includes(getBlock(-71,0))) x-=71;
  }
  if (danger.includes(getBlock(14,0))&&power!="rage") die(); /* right wall */
  else if (getBlock(14,0)=="+") die("win");
  else if (collide.includes(getBlock(14,0))) {
    x=Math.floor((x-5)/40)*40+10;
    if ((aDown||dDown)&&Math.abs(xv*100)>1) {
      if (wDown&&getBlock(0,0)!="w"&&!onALadder&&!reverseGrav) {
        yv=10;
        xv*=-1;
      }
      else if (sDown&&getBlock(0,0)!="w"&&!onALadder&&reverseGrav) {
        yv=-10;
        xv*=-1;
      }
      else xv*=-0.5;
    }
    else xv=0;
    if (power=="trans"&&!collide.includes(getBlock(71,0))) x+=71;
  }
  if (getBlock(-40,0)=="L") xv+=2;
  if (getBlock(40,0)=="R") xv-=2;
  if (getBlock(0,-40)=="B") yv+=2;
  document.querySelector("#player").style.left=x+"px";
  document.querySelector("#player").style.bottom=y+"px";
  if (v) window.scrollTo(x-document.body.scrollWidth/3,document.body.scrollHeight-document.body.clientHeight-y);
};
function getBlock(nx,ny,getDebugInfo) {
  var getDebugInfo;
  nx=Math.round((x+nx-5)/40);ny=Math.round((y+ny-5)/40);
  if (getDebugInfo) console.log("X:"+nx+"Y:"+ny);
  var zzz=levels[lev][levels[lev].length-1-ny];
  if (zzz===undefined) {
    return "@";
  } else {
    return zzz[nx];
  }
}
function setBlock(nx,ny,block) { // be sure to call render(); after this
  nx=Math.round((x+nx-5)/40);ny=levels[lev].length-1-Math.round((y+ny-5)/40);
  if (levels[lev][ny]!==undefined) {
    levels[lev][ny]=levels[lev][ny].slice(0,nx)+block+levels[lev][ny].slice(nx+1);
  }
}
function foo(ox,oy) {
  console.log(Math.round((x+ox-5)/40));
  console.log(Math.round((y+oy-5)/40));
  console.log(getBlock(ox,oy));
}
function die(type) {
  var type;
  document.querySelector("#message").textContent="";
  if (!pausd) {
    pausd=true;
    clearInterval(wow);
  }
  if (type=="win") {
    document.querySelector("#player").className="winner";
    console.log("Time for level "+lev+": "+((Date.now()-time)/1000)+" secs");
  } else {
    document.querySelector("#player").className="die";
  }
  setTimeout(function(){
    if (document.querySelector("#player").className=="winner") {
      lev++;render(lev);
      cpx=40;
      cpy=40;
    }
    xv=0,yv=0,x=cpx,y=cpy,power='';
    play();
    if (pausd) {
      pausd=false;
      wow=setInterval(play,33);
    }
    document.querySelector("#player").className="";
    time=Date.now();
  },500);
}
function rand(min,max) {
  return Math.floor(Math.random()*(max-min+1))+min;
}
function createRandomLevel() {
  var floorlength,level=[],k;
  function build(dat,rev) {
    var rev;
    for (var i=0;i<6;i++) {
      level[i]+=dat[i];
      if (i==5&&level.length>6) {
        var pos=dat[5].indexOf("#");
        while (pos!==-1) {
          var tem = level[6][40-pos] + level[7][40-pos] + level[8][40-pos] + level[9][40-pos] + level[10][40-pos] + level[11][40-pos];
          if (tem=="     &") level[11] = level[11].slice(0,pos) + "^" + level[11].slice(pos+1);
          pos=dat[5].indexOf('#',pos + 1);
        }
      }
    }
  }
  for (var j=0;j<4;j++) {
    level.splice(0,0,"","","","","","");
    if (j==0) {
      build(start);
    } else {
      build(upwards2);
    }
    floorlength=40;
    var nextbit;
    while (floorlength>9) {
      k=rand(0,4);
      floorlength-=k+4;
      nextbit=parts[k][rand(0,parts[k].length-1)];
      for (var i=0;i<5;i++) {
        if ((!collide.includes(nextbit[i][0])||nextbit[i][0]=="w")&&(!collide.includes(level[i][level[i].length-1])||level[i][level[i].length-1]=="w")) {
          break;
        }
      }
      if (i==5) {
        floorlength--;
        for (var i=0;i<5;i++) {
          level[i]+=" ";
        }
        level[5]+="@";
      }
      build(nextbit);
    }
    for (var i=0;i<5;i++) {
      level[i]+=" ";
    }
    level[5]+="@";
    floorlength--;
    if (floorlength>3) {
      build(parts[floorlength-4][rand(0,parts[floorlength-4].length-1)]);
    } else {
      for (var i=0;i<5;i++) {
        level[i]+=" ".repeat(floorlength);
      }
      level[5]+="@".repeat(floorlength);
    }
    if (j==3) {
      build(fin);
    } else {
      build(upwards1);
    }
    if (j%2==1) {
      for (var i=0;i<6;i++) {
        level[i]=level[i].split("").reverse().join("");
        level[i]=level[i].replace(/</g,"~");
        level[i]=level[i].replace(/>/g,"<");
        level[i]=level[i].replace(/~/g,">");
        level[i]=level[i].replace(/L/g,"~");
        level[i]=level[i].replace(/R/g,"L");
        level[i]=level[i].replace(/~/g,"R");
      }
    }
  }
  level.splice(0,0,"@".repeat(48));

  level.splice(0,0,["This is a randomly generated level with 4 floors of mini-platformer-ness.","Next floor!","Almost there!"]);
  levels=[level,[["Congrats! The time is posted in the Javascript console."],"`g`","g g","`0`",]];
  startPlaying();
}
document.querySelector("#load").onclick=function(){
  levels=[JSON.parse(document.querySelector("textarea").value),[["Congrats! The time is posted in the Javascript console."],"`g`","g g","`0`",]];
  startPlaying();
}
document.querySelector("#exampleload").onclick=function(){
  levels=[exampleLevels[0],[["Congrats! The time is posted in the Javascript console."],"`g`","g g","`0`",]];
  startPlaying();
}
startPlaying();
/* MADE BY SEAN */
