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
var level=JSON.parse(localStorage.getItem('level')),hist=[JSON.parse(JSON.stringify(level)).slice(1)],redoHist=[];
if (!level[0].length||typeof level[0][0]!='object') { // for the level data things
  level.splice(0,0,{cpx:40,cpy:40});
  localStorage.setItem('level',JSON.stringify(level));
}
var paletteIdToPaletteLabel={
  space:"air",at:"solid",hash:"lava",plus:"destination",carrot:"jumpboost",v:"stickyground",aster:"ice",equals:"mud",w:"water",less:"leftconveyorbelt",great:"rightconveyorbelt",c:"checkpoint",r:"leftfan",l:"rightfan",b:"upfan",quote:"downfan",amp:"autojumppad",g:"gold",s:"sand",a:"lavatosolidpowerup",backtick:"usedpowerup",i:"liquificationpowerup",p:"pillarpowerup",f:"fire",e:"ladder",semi:"slammerpowerup",o:"ragepowerup",m:"midastouchpowerup",t:"transparentblockspowerup",ý:"solidlava",á:"invisiblesolid",é:"dangeroussolid",í:"invisiblelava",ó:"transparentsolid",ú:"transparentlava",y:"gravity",u:"confusion",d:"fadingblock",n:"unstablesolid",q:"unstableair",h:"SHEEP"
},paletteLabelToClassName={
  air:"air",solid:"ground",lava:"lava",destination:"win",jumpboost:"jump topOnly",stickyground:"nojump topOnly",ice:"ice",mud:"mud topOnly",water:"water",leftconveyorbelt:"left topOnly",rightconveyorbelt:"right topOnly",checkpoint:"check topOnly",leftfan:"fanR",rightfan:"fanL",upfan:"fanB",downfan:"fanT",autojumppad:"ajump topOnly",gold:"gold",sand:"sand",lavatosolidpowerup:"antilava topOnly",usedpowerup:"nopower",liquificationpowerup:"liquify topOnly",pillarpowerup:"pillar topOnly",fire:"fire",ladder:"ladder",slammerpowerup:"slam topOnly",ragepowerup:"rage topOnly",midastouchpowerup:"midas topOnly",transparentblockspowerup:"trans topOnly",solidlava:"sl",invisiblesolid:"sa",dangeroussolid:"ls",invisiblelava:"la",transparentsolid:"as",transparentlava:"al",gravity:"grav",text:"text topOnly",confusion:"conf",fadingblock:"fade",unstablesolid:"unes",unstableair:"unet",SHEEP:"SHEEPER"
},paletteLabelToSymbol={
  air:" ",solid:"@",lava:"#",destination:"+",jumpboost:"^",stickyground:"v",ice:"*",mud:"=",water:"w",leftconveyorbelt:"<",rightconveyorbelt:">",checkpoint:"C",leftfan:"R",rightfan:"L",upfan:"B",downfan:"|",autojumppad:"&",gold:"g",sand:"s",lavatosolidpowerup:"a",usedpowerup:"`",liquificationpowerup:"i",pillarpowerup:"p",fire:"f",ladder:"e",slammerpowerup:";",ragepowerup:"o",midastouchpowerup:"m",transparentblockspowerup:"t",solidlava:"ý",invisiblesolid:"á",dangeroussolid:"é",invisiblelava:"í",transparentsolid:"ó",transparentlava:"ú",gravity:"y",confusion:"u",fadingblock:"d",unstablesolid:"n",unstableair:"q",SHEEP:"h"
},paletteLabelToDesc={
  air:"The normal invisible thing that you can't collide into.",
  solid:"An ordinary block that hurts if you run and jump into it, so don't.",
  lava:"A really hot liquidy thing that kills you too fast.",
  destination:"This is what people have to touch to feel accomplished.",
  jumpboost:"Makes you jump higher.",
  stickyground:"You can't jump on this.",
  ice:"It's a bit slippery and hard to move on.",
  mud:"A muddy block that makes you move slower.",
  water:"A liquid that you can swim in without dying too quickly.",
  leftconveyorbelt:"Stand on it and you magically move to the left.",rightconveyorbelt:"Stand on it and you magically move to the right.",
  checkpoint:"After standing on this you'll resurrect here when you die.",
  leftfan:"Pushes you to the left.",rightfan:"Pushes you to the right.",upfan:"Pushes you upwards and allows you to swim through the air.",downfan:"A decorational block that just finishes the family of fans.",
  autojumppad:"Makes you jump higher and also does it for you.",
  gold:"A shiny decorational block to make you feel rich even though you aren't.",sand:"A boring decorational block.",
  lavatosolidpowerup:"Turns dangerous blocks into their solid lookalikes.",usedpowerup:"An uninteresting block.",liquificationpowerup:"Creates water and ice and things.",pillarpowerup:"Creates a pillar when you jump and also sets your resurrection point.",
  fire:"A dangerous block that kills you a bit slower than lava.",
  ladder:"You can climb this by pressing w and s to descend.",
  slammerpowerup:"Press s and it'll destroy the block under you, given that you are a block above nothingness.",ragepowerup:"Superspeed and lava-proofness.",midastouchpowerup:"Turns nearby blocks into gold; activates automatically.",transparentblockspowerup:"Goes through walls and ceilings a block thick. Press s to fall through the floor.",
  solidlava:"A safer, solider kind of lava.",invisiblesolid:"What seems to be air actually is an invisible wall.",dangeroussolid:"What seems to be the safe familiar solid turns out to be the rapidly killing lava disguised as solid.",invisiblelava:"Some kind of really hot air.",transparentsolid:"Walls that you can walk through.",transparentlava:"Lava that doesn't hurt you and instead you just fall through it.",
  gravity:"Reverses gravity; powerups and related blocks won't work while you're on the ceiling.",
  confusion:"Your controls are messed around with.",
  fadingblock:"Pillars create this block; fades away into air after a bit when near the player.",
  unstablesolid:"Turns transparent after a bit when near the player.",unstableair:"Turns solid after a bit when near the player.",
  SHEEP:"A WONDERFUL BLOCK THAT HAS A SHEEP FACE ON IT.",
},levDat={
  // 'nbtKeyExample':{'def':'defaultValue','sel':'css selector for box'},
  'cpx':{'def':40,'sel':'#cpx','num':1},
  'cpy':{'def':40,'sel':'#cpy','num':1},
  'initPowerup':{'def':'none','sel':'.newtext #initpow span','issel':1},
  'initPowerupLength':{'def':'','sel':'.newtext #initpowlen','num':1},
  'SHEEPurl':{'def':'','sel':'.newtext #sheepurl'},
  'SHEEPphys':{'def':'transparent','sel':'.newtext #sheepphys span','issel':1},
};
var inputStuff="",textStyle="";
for (var i=0;i<10;i++) {
  paletteIdToPaletteLabel["t"+i]="textblock"+i;
  paletteLabelToClassName["textblock"+i]="t"+i+" text topOnly";
  paletteLabelToSymbol["textblock"+i]=i.toString();
  paletteLabelToDesc["textblock"+i]="Displays text on the screen.";
  inputStuff+='Text block '+i+': <input type="text" placeholder="Text to display" id="i'+i+'"/><br>';
  textStyle+=".t"+i+":after {content: 't"+i+"';}";
}
document.querySelector("#text").innerHTML+=inputStuff;
document.head.innerHTML+="<style>"+textStyle+"</style>";
fillInNBT(level[0][0]);
for (var i=1;i<level.length;i++) {
  level[i]=level[i].replace(/\./g,' ');
}
if (level[0].length>1) {
  for (var i=1;i<level[0].length;i++) {
    document.querySelector("#i"+(i-1)).value=level[0][i];
  }
}
var innerht='',blockClasses=[],ids="";
//textStyle="";
for (var span in paletteIdToPaletteLabel) {
  innerht+='<div class="icon2 '+paletteLabelToClassName[paletteIdToPaletteLabel[span]]+'" data-label="'+paletteIdToPaletteLabel[span]+'"></div>';
  blockClasses.push(paletteLabelToClassName[paletteIdToPaletteLabel[span]]);
  ids+=paletteLabelToSymbol[paletteIdToPaletteLabel[span]];
}
function render() {
  var data="";
  if (typeof level[0]=="object") {
    level.splice(0,1);
  }
  for (var i=0;i<level.length;i++) {
    data+="<div class='levelRow' id='r"+i+"'>";
    for (var j=0;j<level[i].length;j++) {
      var id=ids.indexOf(level[i][j]);
      if (id>-1) id=blockClasses[id];
      else if (level[i][j]!=" ") id="glitch";
      data+="<div class='levelBlock "+id+"' style='top:"+(i*40)+"px;left:"+(j*40)+"px;' id='c"+j+"'></div>";
    }
    data+="</div>";
  }
  document.querySelector(".level").innerHTML=data;
  document.querySelector("#width").value=level[0].length;
  document.querySelector("#height").value=level.length;
  document.querySelector(".level").style.width=(level[0].length*40)+"px";
  document.querySelector(".level").style.height=(level.length*40)+"px";
}
render();
document.querySelector("#palette").innerHTML+=innerht;
document.querySelector(".icon2.ground").className+=" sel";
document.querySelector("#palette").onmouseover=function(e){
  if (/icon2/.test(e.target.className)&&!document.querySelector('#info')) {
  var s=document.createElement("div");
  s.id="info";
  if (e.target.id=="PICKER") s.innerHTML='<b>Block picker</b><br>Click on a block with this selected and it\'ll select that block.';
  else s.innerHTML='<div class="'+paletteLabelToClassName[e.target.dataset.label]+'"></div><b>'+e.target.dataset.label+'</b><br>'+paletteLabelToDesc[e.target.dataset.label];
  document.querySelector('#palette').parentNode.insertBefore(s,document.querySelector('#palette').nextSibling);
  }
}
document.querySelector("#palette").onmouseout=function(e){
  if (document.querySelector('#info')) {
    document.body.removeChild(document.querySelector('#info'));
  }
}
document.querySelector("#palette").onclick=document.querySelector("#palette").ontouchstart=function(e){
  if (/icon2/i.test(e.target.className)) {
    document.querySelector(".sel").className=document.querySelector(".sel").className.replace(" sel",'');
    e.target.className+=" sel";
  }
}
document.querySelector("#mleft").onclick=function(){
  document.querySelector("#palette").scrollLeft-=document.querySelector("#palette").clientWidth-120;
}
document.querySelector("#mrite").onclick=function(){
  document.querySelector("#palette").scrollLeft+=document.querySelector("#palette").clientWidth-120;
}
var mD=false;
document.querySelector(".level").onmousedown=function(e){mD=true;doSomething(e.target);}
document.querySelector(".level").ontouchstart=function(e){mD=true;doSomething(e.changedTouches[0].target);}
document.querySelector(".level").onmouseup=function(){mD=false;ANEDITHASBEENMADE();}
document.querySelector(".level").ontouchend=function(){mD=false;ANEDITHASBEENMADE();}
document.querySelector(".level").onmouseover=function(e){if (mD) doSomething(e.target);}
document.querySelector(".level").ontouchmove=function(e){if (mD) doSomething(document.elementFromPoint(e.changedTouches[0].clientX,e.changedTouches[0].clientY));e.preventDefault();}
function ANEDITHASBEENMADE() {
  function arraysEqual(a,b) { // http://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
    if (a===b) return true;
    if (a==null||b==null) return false;
    if (a.length!=b.length) return false;
    for (var i=0;i<a.length;i++) {
      if (a[i]!=b[i]) return false;
    }
    return true;
  }
  if (!arraysEqual(level,hist[hist.length-1])) {
    hist.push(JSON.parse(JSON.stringify(level))); // otherwise they'll update each other
    redoHist=[];
  }
  if (hist.length>1) document.querySelector("#undo").className=document.querySelector("#undo").className.replace(/ dis/g,'');
  else document.querySelector("#undo").className+=" dis";
  if (redoHist.length) document.querySelector("#redo").className=document.querySelector("#redo").className.replace(/ dis/g,'');
  else document.querySelector("#redo").className+=" dis";
}
function doSomething(target) {
  if (target.className.slice(0,10)=="levelBlock") {
    var row=Number(target.parentNode.id.slice(1)),col=Number(target.id.slice(1));
    if (document.querySelectorAll(".sel")[0].dataset.label=="PICKER") {
      document.querySelector(".sel").className=document.querySelector(".sel").className.replace(" sel",'');
      document.querySelector('.icon2.'+target.className.slice(11).replace(/ /g,'.')).className+=" sel";
      document.querySelector(".sel").scrollIntoView();
    } else {
      target.className="levelBlock "+paletteLabelToClassName[document.querySelectorAll(".sel")[0].dataset.label];
      level[row]=level[row].slice(0,col)+paletteLabelToSymbol[document.querySelectorAll(".sel")[0].dataset.label]+level[row].slice(col+1);
    }
  }
}
document.body.onkeydown=function(e){
  var currentblock=document.querySelectorAll(".sel")[0].dataset.label;
  if (currentblock=="PICKER") currentblock="air";
  switch (e.keyCode) {
    case 37:
      if (level[0].length>3) {
        for (var i=0;i<level.length;i++) {
          level[i]=level[i].slice(0,-1);
        }
      }
      break;
    case 39:
      for (var i=0;i<level.length;i++) {
        level[i]+=paletteLabelToSymbol[currentblock];
      }
      break;
    case 40:
      if (level.length>3) {
        level.splice(0,1);
      }
      break;
    case 38:
      level.splice(0,0,paletteLabelToSymbol[currentblock].repeat(level[0].length));
      break;
    case 13:
      if (e.ctrlKey) {
        window.location='../';
        e.preventDefault();
      }
      break;
    case 89:
      if (e.ctrlKey) {
        redo();
        e.preventDefault();
      }
      break;
    case 90:
      if (e.ctrlKey) {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      }
      break;
    case 67:
      document.querySelector(".sel").className=document.querySelector(".sel").className.replace(" sel",'');
      document.querySelector('#PICKER').className+=" sel";
      break;
  }
  if(e.keyCode>=37&&e.keyCode<=40){
    ANEDITHASBEENMADE();
    render();
    e.preventDefault();
  }
};
document.querySelector("#width").onchange=function(){
  var currentblock=document.querySelectorAll(".sel")[0].dataset.label;
  if (currentblock=="PICKER") currentblock="air";
  var w=Number(document.querySelector("#width").value);
  if (w<3) {
    w=3;
    document.querySelector("#width").value=3;
  }
  if (level[0].length>w) {
    for (var i=0;i<level.length;i++) {
      level[i]=level[i].slice(0,w-level[i].length);
    }
  } else if (level[0].length<w) {
    for (var i=0;i<level.length;i++) {
      level[i]+=paletteLabelToSymbol[currentblock].repeat(w-level[i].length);
    }
  }
  ANEDITHASBEENMADE()
  render();
};
document.querySelector("#height").onchange=function(){
  var currentblock=document.querySelectorAll(".sel")[0].dataset.label;
  if (currentblock=="PICKER") currentblock="air";
  var h=Number(document.querySelector("#height").value);
  if (h<3) {
    h=3;
    document.querySelector("#height").value=3;
  }
  if (level.length>h) {
    level.splice(0,level.length-h);
  } else if (level.length<h) {
    var j=level.length;
    for (var i=0;i<h-j;i++) {
      level.splice(0,0,paletteLabelToSymbol[currentblock].repeat(level[0].length));
    }
  }
  ANEDITHASBEENMADE()
  render();
};
function highlight(element) { // based off http://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
  if (document.body.createTextRange) {
    var ran=document.body.createTextRange();
    ran.moveToElementText(document.querySelector(element));
    ran.select();
  } else if (window.getSelection) {
    var sel=window.getSelection(), ran=document.createRange();
    sel.removeAllRanges(),ran.selectNodeContents(document.querySelector(element))
    sel.addRange(ran);
  }
}
document.querySelector("#done").onclick=function(){
  document.querySelector('.new').style.display="block";
  document.querySelector('#close').innerHTML="Close";
  var texts=[],blankForever=-1;
  texts.push(getNbt());
  for (var i=0;i<10;i++) {
    texts.push(document.querySelector("#i"+i).value);
    if (document.querySelector("#i"+i).value) blankForever=i;
  }
  texts.splice(blankForever+2);
  blankForever=JSON.parse(JSON.stringify(level));
  blankForever.splice(0,0,texts);
  document.querySelector("textarea").value=JSON.stringify(blankForever);
  document.querySelector("textarea").select();
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
  localStorage.setItem('level',JSON.stringify(danewcode));
}
document.querySelector("#save").onclick=save;
document.querySelector("#doneBit").onclick=function(){
  document.querySelector('.new').style.display="block";
  document.querySelector('#close').innerHTML="Close";
  document.querySelector("textarea").value="[\n  \""+level.join("\",\n  \"")+"\"\n],";
  document.querySelector("textarea").select();
}
document.querySelector("#doneLink").onclick=function(){
  document.querySelector('.new').style.display="block";
  document.querySelector('#close').innerHTML="Close";
  var texts=[],blankForever=-1;
  texts.push(getNbt());
  for (var i=0;i<10;i++) {
    texts.push(document.querySelector("#i"+i).value);
    if (document.querySelector("#i"+i).value) blankForever=i;
  }
  texts.splice(blankForever+2);
  blankForever=JSON.parse(JSON.stringify(level));
  blankForever.splice(0,0,texts);
  function encode(str) {
    var r='';
    for (var i=0;i<str.length;i++) {
      var t=str[i].charCodeAt().toString(16);
      if (t.length<2) t='0'+t;
      r+=t;
    }
    return r;
  }
  blankForever=encode(JSON.stringify(blankForever));
  document.querySelector("textarea").value="https://sheeptester.github.io/platformre/maker/?"+blankForever;
  document.querySelector("textarea").select();
};
function fillInNBT(nbt) {
  if (nbt) {
    for (var key in levDat) {
      if (levDat[key].issel) {
        if (nbt[key]) document.querySelector(levDat[key].sel).innerHTML=nbt[key];
        else document.querySelector(levDat[key].sel).innerHTML=levDat[key].def;
      } else {
        if (nbt[key]) document.querySelector(levDat[key].sel).value=nbt[key];
        else document.querySelector(levDat[key].sel).value=levDat[key].def;
      }
    }
  } else {
    for (var key in levDat) {
      if (levDat[key].issel) document.querySelector(levDat[key].sel).innerHTML=levDat[key].def;
      else document.querySelector(levDat[key].sel).value=levDat[key].def;
    }
  }
}
function getNbt() {
  var nbt={};
  for (var key in levDat) {
    var val;
    if (levDat[key].issel) val=document.querySelector(levDat[key].sel).innerHTML;
    else val=document.querySelector(levDat[key].sel).value;
    if (val&&val!=levDat[key].def) {
      if (levDat[key].num) nbt[key]=Number(val);
      else nbt[key]=val;
    }
  }
  return nbt;
}
document.querySelector("#loadopen").onclick=function(){
  document.querySelector('.new').style.display="block";
  document.querySelector("textarea").value="";
  document.querySelector("textarea").focus();
  var button=document.createElement('BUTTON');
  button.id="load";
  button.innerHTML="OK";
  document.querySelector('.new').appendChild(button);
  document.querySelector('#close').innerHTML="Cancel";
  document.querySelector("#load").onclick=function(){
    document.querySelector('.new').style.display="none";
    document.querySelector('.new').removeChild(document.querySelector('#load'));
    level=JSON.parse(document.querySelector("textarea").value);
    for (var i=1;i<level.length;i++) {
      level[i]=level[i].replace(/\./g,' ');
    }
    fillInNBT(level[0][0]);
    for (var i=1;i<11;i++) {
      if (level[0][i]) document.querySelector("#i"+(i-1)).value=level[0][i];
      else document.querySelector("#i"+(i-1)).value='';
    }
    render();
  }
}
function example(id) {
  level=JSON.parse(JSON.stringify(exampleLevels[id*3]));
  fillInNBT(level[0][0]);
  for (var i=1;i<11;i++) {
    if (level[0][i]) document.querySelector("#i"+(i-1)).value=level[0][i];
    else document.querySelector("#i"+(i-1)).value='';
  }
  render();
}
function httpGetAsync(theUrl,callback) {
  var xmlHttp=new XMLHttpRequest();
  xmlHttp.onreadystatechange=function(){
    if (xmlHttp.readyState==4&&xmlHttp.status==200) callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET",theUrl,true); // true for asynchronous
  xmlHttp.send(null);
}
if (window.location.search) {
  if (window.location.search.slice(1,6)=='level') {
    httpGetAsync('https://web300.secure-secure.co.uk/thingkingland.com/sheeptester/getlevel.php?id='+window.location.search.slice(7),function(e){
      level=JSON.parse(e)[2];
      fillInNBT(level[0][0]);
      for (var i=1;i<11;i++) {
        if (level[0][i]) document.querySelector("#i"+(i-1)).value=level[0][i];
        else document.querySelector("#i"+(i-1)).value='';
      }
      render();
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
      level=JSON.parse(levelcodefromurl);
      levelcodefromurl=false;
    }
    catch(err) {
      // window.location=window.location.href.slice(0,window.location.href.lastIndexOf('?'));
    }
    finally {
      if (!levelcodefromurl) {
        fillInNBT(level[0][0]);
        for (var i=1;i<11;i++) {
          if (level[0][i]) document.querySelector("#i"+(i-1)).value=level[0][i];
          else document.querySelector("#i"+(i-1)).value='';
        }
        render();
      }
    }
  }
}
document.querySelector('.newtext #initpow ul').onclick=function(e){
  if (e.target.tagName=="LI") {
    document.querySelector('.newtext #initpow span').innerHTML=e.target.innerHTML;
  }
}
document.querySelector('.newtext #sheepphys ul').onclick=function(e){
  if (e.target.tagName=="LI") {
    document.querySelector('.newtext #sheepphys span').innerHTML=e.target.innerHTML;
  }
}
document.querySelector("#close").onclick=function(){
  document.querySelector('.new').style.display="none";
}
document.querySelector("#closet").onclick=function(){
  document.querySelector('.newtext').style.display="none";
}
document.querySelector("#test").onclick=function(){
  save();
  window.location.href='../';
  return false;
}
/*document.querySelector("#template").onclick=function(){
  if (level.length>6) {
    level.splice(0,level.length-6);
  } else if (level.length<6) {
    var j=level.length;
    for (var i=0;i<6-j;i++) {
      level.splice(0,0,"@".repeat(level[0].length));
    }
  }
  render();
}*/
document.querySelector("#undo").onclick=undo;
function undo() {
  if (hist.length-1) {
    redoHist.push(hist.pop());
    level=JSON.parse(JSON.stringify(hist[hist.length-1]));
    render();
  }
  if (hist.length>1) document.querySelector("#undo").className=document.querySelector("#undo").className.replace(/ dis/g,'');
  else document.querySelector("#undo").className+=" dis";
  if (redoHist.length) document.querySelector("#redo").className=document.querySelector("#redo").className.replace(/ dis/g,'');
  else document.querySelector("#redo").className+=" dis";
}
function redo() {
  if (redoHist.length) {
    hist.push(redoHist.pop());
    level=JSON.parse(JSON.stringify(hist[hist.length-1]));
    render();
  }
  if (hist.length>1) document.querySelector("#undo").className=document.querySelector("#undo").className.replace(/ dis/g,'');
  else document.querySelector("#undo").className+=" dis";
  if (redoHist.length) document.querySelector("#redo").className=document.querySelector("#redo").className.replace(/ dis/g,'');
  else document.querySelector("#redo").className+=" dis";
}
document.querySelector("#redo").onclick=redo;
document.querySelector("#tools").ontouchstart=function(e){
  if (document.querySelector(".hover")) document.querySelector(".hover").className=document.querySelector(".hover").className.replace(/ hover/g,'');
  if (/\bdropdown\b/.test(e.target.className)) {
    e.target.className+=" hover";
  }
}
document.querySelector("#closett").onclick=function(){
  document.querySelector('.newhelp').style.display="none";
};
document.querySelector("#reset").onclick=function(){
  if (confirm("Are you sure you want to reset the cookie's level code?\nOnly reset if something very wrong has happened to your cookie and it's now corrupted and making things not work.")) {
    localStorage.removeItem('level');
    window.location.reload();
  }
};
/*window.onbeforeunload = function() {
  return '';
};*/
/*
[[],
"@@@@@@@@",
"@@C@@@@@",
"@CCCC@@@",
"@@=@C@@@",
"@=@@@@@@",
"@=@@@@@@",
"@=@@@@@@",
"sss@@@@@",
"ssssswww"
]
*/
/* MADE BY SEAN */
