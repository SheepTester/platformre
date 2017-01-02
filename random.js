var levels=[[],[[{initPowerup:'liquify'},"Congrats!",'','',''],"g````g","L    `","`0123`",]];
if(!localStorage.getItem('level')) {
  localStorage.setItem('level',JSON.stringify([[{cpx:80,cpy:80},"Hello world!"],
    "@@@@@@@@@@@@@@@@@+@@",
    "@              @@w@@",
    "@               www@",
    "@   @===@       www@",
    "@     #         www@",
    "@     #        @w@@@",
    "@v^@0###*>><<**@@@@@",
  ]));
}
levels[0]=JSON.parse(localStorage.getItem('level'));
if (!levels[0][0].length||typeof levels[0][0][0]!='object') {
  levels[0].splice(0,0,{cpx:40,cpy:40});
  localStorage.setItem('level',JSON.stringify(levels[0]));
}
function registerNBT(nbt) {
  cpx=40;cpy=40;
  if (nbt) {
    if (nbt.cpx) cpx=nbt.cpx;
    if (nbt.cpy) cpy=nbt.cpy;
    if (nbt.initPowerup) {
      power=nbt.initPowerup;
      clearTimeout(powerupdelay);
      if (nbt.initPowerupLength) {
        powerupdelay=setTimeout(function(){
          power='';
        },nbt.initPowerupLength*1000);
      }
      else powerupdelay=0;
    } else {
      power='';
    }
    if (nbt.SHEEPurl) {
      document.querySelector('#SHEEPIMG').innerHTML=".SHEEPER{background-image:url("+nbt.SHEEPurl+");}";
    }
    if (nbt.SHEEPphys) {
      if (collide.includes('h')) collide.splice(collide.indexOf('h'),1);
      if (danger.includes('h')) danger.splice(danger.indexOf('h'),1);
      if (nbt.SHEEPphys=='solid') collide.push('h');
      else if (nbt.SHEEPphys=='dangerous') danger.push('h');
    }
  }
  x=cpx;y=cpy;
}
function startPlaying() {
  lev=0;
  render(0);
  xv=0,yv=0;
  registerNBT(levels[0][0][0]);
  if (pausd) {
    pausd=false;
    wow=setInterval(play,33);
  }
  time=Date.now();
  deaths=0;
  pus=0;
}
function render(level) {
  var blockClasses=["ground","lava","win","jump topOnly","mud topOnly","nojump topOnly","ice","water","left topOnly","right topOnly","check topOnly","fanL","fanR","fanB","fanT","ajump topOnly","gold","sand","antilava topOnly","nopower","liquify topOnly","pillar topOnly","fire","ladder","slam topOnly","rage topOnly","midas topOnly","trans topOnly","sl","ls","as","al","grav","conf","fade","unes","unet","SHEEPER"],
  ids="@#+^=v*w<>CLRB|&gsa`ipfe;omtýéóúyudnqh",
  data="<div id='player'></div>",level;
  if (level===undefined) {
    level=lev;
  }
  for (var i=1;i<levels[level].length;i++) {
    for (var j=0;j<levels[level][i].length;j++) {
      var id=ids.indexOf(levels[level][i][j]);
      if (id!==-1) id=blockClasses[id];
      else if (/[0-9]/.test(levels[level][i][j])) id="text topOnly";
      else if (!" .áí".split('').includes(levels[level][i][j])) id="glitch";
      if (id!==-1) {
        data+="<div class='levelBlock "+id+"' style='top:"+(i*40-40)+"px;left:"+(j*40)+"px;'></div>";
      }
    }
  }
  document.querySelector(".level").innerHTML=data;
  document.querySelector(".level").style.height=(levels[level].length*40)+"px";
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
    case 38:
      wDown=true;
      break;
    case 37:
      aDown=true;
      break;
    case 40:
      sDown=true;
      break;
    case 39:
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
  if(e.keyCode>=37&&e.keyCode<=40){
    e.preventDefault();
    return false;
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
    case 38:
      wDown=false;
      break;
    case 37:
      aDown=false;
      break;
    case 40:
      sDown=false;
      break;
    case 39:
      dDown=false;
      break;
    case 32:
      spaceDown=false;
      break;
  }
};
/* plattformre script based off those from Scratch */
var xv=0,yv=0,x=40,y=40,lev=0,cpx=40,cpy=40,collide="@^v*=<>0123456789CLRB|&gsa`ip;omtýádn".split(''),danger="#éí".split(''),power,powerupdelay=-1,v,time,deaths,pus,play=function(){
  x+=xv;y+=yv;
  // updateLevel();
  var nearBys=[getBlock(-10,-10),getBlock(10,-10),getBlock(-10,10),getBlock(10,10)],
  onALadder=nearBys.includes("e"),
  collidingWithWall=collide.includes(getBlock(-15,0))||collide.includes(getBlock(14,0)),
  water,
  powerupPadId="aip;ot".split(''),
  powerupName=["antilava","liquify","pillar","slam","rage","trans"],
  powerupLength=[5,2,1,5,3,5],
  reverseGrav=nearBys.includes("y"),
  confYes=nearBys.includes("u"),
  sD=confYes?dDown:sDown,dD=confYes?wDown:dDown,wD=confYes?aDown:wDown,aD=confYes?sDown:aDown,
  anyChanges=false,tt;
  if (power) { /* powerups */
    switch (power) {
      case "antilava":
        for (var i=0;i<9;i++) {
          tt=getBlock(i%3*40-40,Math.floor(i/3)*40-40);
          anyChanges=true;
          if (tt=='#') setBlock(i%3*40-40,Math.floor(i/3)*40-40,"ý");
          else if (tt=="é") setBlock(i%3*40-40,Math.floor(i/3)*40-40,"@");
          else if (tt=="í") setBlock(i%3*40-40,Math.floor(i/3)*40-40,"á");
          else if (tt=="f") setBlock(i%3*40-40,Math.floor(i/3)*40-40," ");
          else anyChanges=false;
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
        tt=getBlock(0,-80);
        if (tt!="d"&&x>40){
          setBlock(0,-80,"d");
          anyChanges=true;
        }
        if (anyChanges) {
          cpx=x;
          cpy=y;
        };
        break;
      case "slam":
        if (sD&&getBlock(0,-16)!=" "&&y>40) {
          var tt=getBlock(0,-16),order="g@`=s &^*w #f ".split('');
          if (order.indexOf(tt)>-1) {
            setBlock(0,-16,order[order.indexOf(tt)+1]);
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
  }
  for (var i=0;i<25;i++) {
    tt=getBlock(i%5*40-80,Math.floor(i/5)*40-80);
    if (tt=="q"&&!Math.floor(Math.random()*60)) {
      setBlock(i%5*40-80,Math.floor(i/5)*40-80,"n");
      anyChanges=true;
    } else if (tt=="n"&&!Math.floor(Math.random()*60)) {
      setBlock(i%5*40-80,Math.floor(i/5)*40-80,"q");
      anyChanges=true;
    } else if (tt=="d"&&!Math.floor(Math.random()*60)) {
      setBlock(i%5*40-80,Math.floor(i/5)*40-80," ");
      anyChanges=true;
    }
  }
  if (anyChanges) render();
  if (getBlock(0,0)=="f"&&power!="rage") die();
  else if (onALadder) {
    yv=0;
    if (wD&&!sD) y+=5;
    else if (!wD&&sD) y-=5;
  }
  if (collidingWithWall?collide.includes(getBlock(0,-16)):collide.includes(getBlock(-10,-16))||collide.includes(getBlock(10,-16))) {
    yv=0;
    y=Math.ceil((y-5)/40)*40;
  }
  if (onALadder) { /* ladder */
    water="climbing";
    if (spaceDown) xv=Math.round(xv*300)/1000;
    else if (aD&&!dD&&xv>-10) xv-=1.5;
    else if (dD&&!aD&&xv<10) xv+=1.5;
    else xv=Math.round(xv*700)/1000;
  }
  else if (nearBys.includes("w")) { /* swimming */
    water="swimming";
    if (spaceDown) {
      xv=Math.round(xv*800)/1000;
      yv=Math.round(yv*800)/1000;
    } else {
      xv=Math.round(xv*950)/1000;
      yv=Math.round(yv*950)/1000;
      if(wD)yv+=1;
      if(aD)xv-=1;
      if(sD)yv-=1;
      if(dD)xv+=1;
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
      document.querySelector("#message").textContent=levels[lev][0][Number(getBlock(0,-16))+1];
      document.querySelector("#message").style.display="block";
    }
  } else if (power) {
    document.querySelector("#message").textContent={antilava:"Lava to solid",liquify:"Liquidification",pillar:"Pillar",slam:"Slammer",rage:"Rage/boss",midas:"Midas' Touch",trans:"Transparent blocks"}[power]+" powerup active";
    document.querySelector("#message").style.display="block";
  }
  else if (document.querySelector("#message").style.display=="block") document.querySelector("#message").style.display="none";
  var amIAboveAFan=(getBlock(0,-40)=="B"||getBlock(0,-80)=="B")&&water=="falling"
  if ((amIAboveAFan||water===undefined)) { /* MOVING */
    if (wD&&!amIAboveAFan&&!reverseGrav) {
      if (power=="rage") yv=30;
      else if (getBlock(0,-16)=="^") yv=20;
      else if (getBlock(0,-16)!="v") yv=15;
    }
    if (reverseGrav) {
      if (sD) {
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
      if (aD&&!dD&&xv>-tempp) {
        if (tempp==5) xv-=0.5;
        else if (tempp==15) xv-=0.5;
        else if (tempp==20) xv-=3;
        else xv-=1.5;
      } else if (dD&&!aD&&xv<tempp) {
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
    if (power=="trans"&&sD) y-=71;
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
    if ((aD||dD)&&Math.abs(xv*100)>1) {
      if (wD&&getBlock(0,0)!="w"&&!onALadder&&!reverseGrav&&getBlock(0,-16)!="v") {
        yv=10;
        xv*=-1;
      } else if (sD&&getBlock(0,0)!="w"&&!onALadder&&reverseGrav) {
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
    if ((aD||dD)&&Math.abs(xv*100)>1) {
      if (wD&&getBlock(0,0)!="w"&&!onALadder&&!reverseGrav&&getBlock(0,-16)!="v") {
        yv=10;
        xv*=-1;
      }
      else if (sD&&getBlock(0,0)!="w"&&!onALadder&&reverseGrav) {
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
  if (getBlock(0,40)=="|") yv-=2;
  document.querySelector("#player").style.left=x+"px";
  document.querySelector("#player").style.bottom=(y+40)+"px";
  // levels[level].length*40-40
  // levels[level][0].length*40-40
  window.scrollTo(x-window.innerWidth/2+20,levels[lev].length*40-(window.innerHeight/2)-y-20);
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
    console.log("Time taken for level "+lev+": "+((Date.now()-time)/1000)+" secs");
    console.log("Death count for level "+lev+": "+deaths+" deaths");
    console.log("Extra powerups used for level "+lev+": "+pus+" powerups");
    levels[1][0][2]=((Date.now()-time)/1000)+" secs";
    levels[1][0][3]=deaths+" deaths";
    levels[1][0][4]=pus+" extra powerups";
  } else {
    document.querySelector("#player").className="die";
    deaths++;
  }
  setTimeout(function(){
    if (document.querySelector("#player").className=="winner") {
      lev++;render(lev);
      registerNBT(levels[lev][0][0]);
      time=Date.now();
      deaths=0;
      pus=0;
    } else {
      x=cpx,y=cpy,power='';
      if (levels[lev][0][0].initPowerup) {
        power=levels[lev][0][0].initPowerup;
        if (levels[lev][0][0].initPowerupLength) {
          powerupdelay=setTimeout(function(){
            power='';
          },levels[lev][0][0].initPowerupLength*1000);
        }
        else powerupdelay=0;
      }
    }
    xv=0,yv=0;
    play();
    if (pausd) {
      pausd=false;
      wow=setInterval(play,33);
    }
    document.querySelector("#player").className="";
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
        if (
          (!collide.includes(nextbit[i][0])&&!danger.includes(nextbit[i][0])&&nextbit[i][0]!=".")
          &&
          (!collide.includes(level[i][level[i].length-1])&&!danger.includes(level[i][level[i].length-1])&&level[i][level[i].length-1]!=".")
        ) {
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

  level.splice(0,0,[{cpx:40,cpy:40},"This is a randomly generated level with 4 floors of mini-platformer-ness.","Next floor!","Almost there!"]);
  levels=[level,[[{initPowerup:'liquify'},"Congrats!",'','',''],"g````g","L    `","`0123`",]];
  startPlaying();
}
document.querySelector("#loadopen").onclick=function(){
  document.querySelector('.new').style.display="block";
  document.querySelector("#close").innerHTML="Cancel";
  document.querySelector("#load").style.display="block";
  document.querySelector("textarea").value="";
  document.querySelector("textarea").focus();
}
document.querySelector("#load").onclick=function(){
  document.querySelector('.new').style.display="none";
  levels=[JSON.parse(document.querySelector("textarea").value),[[{initPowerup:'liquify'},"Congrats!",'','',''],"g````g","L    `","`0123`",]];
  startPlaying();
}
document.querySelector("#close").onclick=function(){
  document.querySelector('.new').style.display="none";
}
document.querySelector("#done").onclick=function(){
  document.querySelector('.new').style.display="block";
  document.querySelector('#close').innerHTML="Close";
  document.querySelector("#load").style.display="none";
  document.querySelector("textarea").value=JSON.stringify(levels[lev]);
  document.querySelector("textarea").select();
};
document.querySelector("#doneBit").onclick=function(){
  document.querySelector('.new').style.display="block";
  document.querySelector('#close').innerHTML="Close";
  document.querySelector("#load").style.display="none";
  document.querySelector("textarea").value="[\n  \""+levels[lev].slice(1).join("\",\n  \"")+"\"\n],";
  document.querySelector("textarea").select();
}
document.querySelector("#doneLink").onclick=function(){
  document.querySelector('.new').style.display="block";
  document.querySelector('#close').innerHTML="Close";
  document.querySelector("#load").style.display="none";
  function encode(str) {
    var r='';
    for (var i=0;i<str.length;i++) {
      var t=str[i].charCodeAt().toString(16);
      if (t.length<2) t='0'+t;
      r+=t;
    }
    return r;
  }
  document.querySelector("textarea").value="https://sheeptester.github.io/platformre/?"+encode(JSON.stringify(levels[lev]));
  document.querySelector("textarea").select();
};
function example(id) {
  if (id!=-1) {
    levels=[JSON.parse(JSON.stringify(exampleLevels[id*3])),[[{initPowerup:'liquify'},"Congrats!",'','',''],"g````g","L    `","`0123`",]];
    startPlaying();
  }
}
function httpGetAsync(theUrl,callback) {
  var xmlHttp=new XMLHttpRequest();
  xmlHttp.onreadystatechange=function(){
    if (xmlHttp.readyState==4&&xmlHttp.status==200) callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET",theUrl,true); // true for asynchronous
  xmlHttp.send(null);
}
var leveldat=[];
if (window.location.search) {
  if (window.location.search.slice(1,6)=='level') {
    httpGetAsync('https://web300.secure-secure.co.uk/thingkingland.com/sheeptester/getlevel.php?id='+window.location.search.slice(7),function(e){
      var s=document.querySelectorAll(".notpublic");
      for (var i=0;i<s.length;i++) {
        s[i].className='';
      }
      leveldat=JSON.parse(e)[0];
      if (user==leveldat[1]) {
        var s=document.querySelectorAll(".notmine");
        for (var i=0;i<s.length;i++) {
          s[i].className='';
        }
      }
      levels=[JSON.parse(e)[1],[[{initPowerup:'liquify'},"Congrats!",'','',''],"g````g","L    `","`0123`",]];
      startPlaying();
    });
  } else {
    function decode(str) {
      var r='';
      for (var i=0;i<str.length;i+=2) {
        var t=str[i].charCodeAt().toString(16);
        r+=String.fromCharCode(parseInt(str[i]+str[i+1],16));
      }
      return r;
    }
    var levelcodefromurl=decode(window.location.href.slice(window.location.href.lastIndexOf('?')+1));
    try {
      levels=[JSON.parse(levelcodefromurl),[[{initPowerup:'liquify'},"Congrats!",'','',''],"g````g","L    `","`0123`",]];
      levelcodefromurl=false;
    }
    catch(err) {
      // window.location=window.location.href.slice(0,window.location.href.lastIndexOf('?'));
    }
    finally {
      if (!levelcodefromurl) startPlaying();
    }
  }
}
document.querySelector("#joystick").onclick=function(){
  document.querySelector("#tools").removeChild(document.querySelector("#joystick"));
  document.body.onkeyup = document.body.onkeydown = "";
  document.querySelector("#joistik").className="";
  document.querySelector("#plause").style.backgroundImage='url("'+(pausd?"icons/play.svg":"icons/pause.svg")+'")';
  var joy=function(e) {
    var xDiff=e.changedTouches[0].clientX-130,yDiff=e.changedTouches[0].clientY-document.querySelector("#move").getBoundingClientRect().top-100;
    wDown=false;aDown=false;dDown=false;sDown=false;
    if (xDiff>30) dDown=true;
    else if (xDiff<-30) aDown=true;
    if (yDiff<-30) wDown=true;
    else if (yDiff>30) sDown=true;
    document.querySelector("#move").style.transform="perspective(100px) rotateY("+(aDown?-5:(dDown?5:0))+"deg) rotateX("+(sDown?-5:(wDown?5:0))+"deg)";
    e.preventDefault();
    return false;
  }
  document.ontouchmove=function(e){
    e.preventDefault();
    return false;
  }
  document.querySelector("#move").ontouchstart=joy;
  document.querySelector("#move").ontouchmove=joy;
  document.querySelector("#move").ontouchend=function(e) {
    wDown=false;aDown=false;dDown=false;sDown=false;
    document.querySelector("#move").style.transform="none";
    e.preventDefault();
  }
  document.querySelector("#brake").ontouchstart=function(e) {
    spaceDown=true;
    e.preventDefault();
  }
  document.querySelector("#brake").ontouchend=function(e) {
    spaceDown=false;
    e.preventDefault();
  }
  document.querySelector("#restart").ontouchstart=function() {
    die();
  }
  document.querySelector("#plause").ontouchstart=function() {
    if (pausd) wow=setInterval(play,33);
    else {
      clearInterval(wow);
      document.querySelector("#message").textContent="Paused";
      document.querySelector("#message").style.display="block";
    }
    document.querySelector("#plause").style.backgroundImage='url("'+(pausd?"icons/pause.svg":"icons/play.svg")+'")';
    pausd=!pausd;
  }
  document.querySelector("sheepmenu").style.display="none";
}
function updateLevel() {
  var changes=0;
  function set(i,j,block) {
    levels[lev][i]=levels[lev][i].slice(0,j)+block+levels[lev][i].slice(j+1);
  }
  for (var i=1;i<levels[lev].length;i++) {
    for (var j=0;j<levels[lev][i].length;j++) {
      changes++;
      switch (levels[lev][i][j]) {
        case 'd':
          if (!Math.floor(Math.random()*60)) set(i,j,' ');
          break;
        case 'n':
          if (!Math.floor(Math.random()*30)) set(i,j,'q');
          break;
        case 'q':
          if (!Math.floor(Math.random()*30)) set(i,j,'n');
          break;
        default:
          changes--;
      }
    }
  }
  if (changes) render();
}
document.querySelector("#tools").ontouchstart=function(e){
  if (document.querySelector(".hover")) document.querySelector(".hover").className=document.querySelector(".hover").className.replace(/ hover/g,'');
  if (/\bdropdown\b/.test(e.target.className)) {
    e.target.className+=" hover";
  }
}
document.querySelector("#closet").onclick=function(){
  document.querySelector('.newtext').style.display="none";
}
document.querySelector("#reset").onclick=function(){
  if (confirm("Are you sure you want to reset the cookie's level code?\nOnly reset if something very wrong has happened to your cookie and it's now corrupted and making things not work.")) {
    localStorage.removeItem('level');
    window.location.reload();
  }
};
function save() {
  var texts=[],blankForever=-1,danewcode;
  if (typeof level[0]=="object") {
    level.splice(0,1);
  }
  danewcode=JSON.parse(JSON.stringify(level));
  texts.push(getNbt());
  for (var i=0;i<10;i++) {
    texts.push(document.querySelector("#i"+i).value);
    if (document.querySelector("#i"+i).value) blankForever=i;
  }
  texts.splice(blankForever+2);
  danewcode.splice(0,0,texts);
}
document.querySelector("#save").onclick=function(){
  localStorage.setItem('level',JSON.stringify(levels[lev]));
};
var user;
if (window.localStorage.getItem('userid')) {
  httpGetAsync('https://web300.secure-secure.co.uk/thingkingland.com/sheeptester/getstuff.php?userid='+window.localStorage.getItem('userid'),function(e){
    var data=JSON.parse(e);
    user=data.username;
    document.querySelector("#user").textContent=user;
    document.querySelector("#user").style.fontWeight='bold';
    if (leveldat.length>0&&leveldat[1]==user) {
      var s=document.querySelectorAll(".notmine");
      for (var i=0;i<s.length;i++) {
        s[i].className='';
      }
    }
  });
}
startPlaying();
/* MADE BY SEAN */
