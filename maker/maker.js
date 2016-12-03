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
var level=JSON.parse(localStorage.getItem('level')),hist=[JSON.parse(JSON.stringify(level)).slice(1)],redoHist=[];
var paletteIdToPaletteLabel={
  space:"air",at:"solid",hash:"lava",plus:"destination",carrot:"jumpboost",v:"stickyground",aster:"ice",equals:"mud",w:"water",less:"leftconveyorbelt",great:"rightconveyorbelt",c:"checkpoint",r:"leftfan",l:"rightfan",b:"upfan",amp:"autojumppad",g:"gold",s:"sand",a:"lavatosolidpowerup",backtick:"usedpowerup",i:"liquificationpowerup",p:"pillarpowerup",f:"fire",e:"ladder",semi:"slammerpowerup",o:"ragepowerup",m:"midastouchpowerup",t:"transparentblockspowerup",ý:"solidlava",á:"invisiblesolid",é:"dangeroussolid",í:"invisiblelava",ó:"transparentsolid",ú:"transparentlava",y:"gravity",u:"confusion",d:"fadingblock",n:"unstablesolid",q:"unstableair"
},paletteLabelToClassName={
  air:"air",solid:"ground",lava:"lava",destination:"win",jumpboost:"jump topOnly",stickyground:"nojump topOnly",ice:"ice",mud:"mud topOnly",water:"water",leftconveyorbelt:"left topOnly",rightconveyorbelt:"right topOnly",checkpoint:"check topOnly",leftfan:"fanR",rightfan:"fanL",upfan:"fanB",autojumppad:"ajump topOnly",gold:"gold",sand:"sand",lavatosolidpowerup:"antilava topOnly",usedpowerup:"nopower",liquificationpowerup:"liquify topOnly",pillarpowerup:"pillar topOnly",fire:"fire",ladder:"ladder",slammerpowerup:"slam topOnly",ragepowerup:"rage topOnly",midastouchpowerup:"midas topOnly",transparentblockspowerup:"trans topOnly",solidlava:"sl",invisiblesolid:"sa",dangeroussolid:"ls",invisiblelava:"la",transparentsolid:"as",transparentlava:"al",gravity:"grav",text:"text topOnly",confusion:"conf",fadingblock:"fade",unstablesolid:"unes",unstableair:"unet"
},paletteLabelToSymbol={
  air:" ",solid:"@",lava:"#",destination:"+",jumpboost:"^",stickyground:"v",ice:"*",mud:"=",water:"w",leftconveyorbelt:"<",rightconveyorbelt:">",checkpoint:"C",leftfan:"R",rightfan:"L",upfan:"B",autojumppad:"&",gold:"g",sand:"s",lavatosolidpowerup:"a",usedpowerup:"`",liquificationpowerup:"i",pillarpowerup:"p",fire:"f",ladder:"e",slammerpowerup:";",ragepowerup:"o",midastouchpowerup:"m",transparentblockspowerup:"t",solidlava:"ý",invisiblesolid:"á",dangeroussolid:"é",invisiblelava:"í",transparentsolid:"ó",transparentlava:"ú",gravity:"y",confusion:"u",fadingblock:"d",unstablesolid:"n",unstableair:"q"
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
  leftconveyorbelt:"Stand on it and you magically move to the left.",rightconveyorbelt:"Stand on it and you magically move to the left.",
  checkpoint:"After standing on this you'll resurrect here when you die.",
  leftfan:"Pushes you to the left.",rightfan:"Pushes you to the right.",upfan:"Pushes you upwards and allows you to swim through the air.",
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
  unstablesolid:"Turns transparent after a bit when near the player.",unstableair:"Turns solid after a bit when near the player."
};
var inputStuff="",textStyle="";
for (var i=0;i<10;i++) {
  paletteIdToPaletteLabel["t"+i]="textblock"+i;
  paletteLabelToClassName["textblock"+i]="t"+i+" text topOnly";
  paletteLabelToSymbol["textblock"+i]=i.toString();
  paletteLabelToDesc["textblock"+i]="Displays text on the screen.";
  inputStuff+='textblock'+i+': <input type="text" placeholder="Text to display" id="i'+i+'"/><br>';
  textStyle+=".t"+i+":after {content: 't"+i+"';}";
}
document.querySelector("#text").innerHTML=inputStuff;
document.head.innerHTML+="<style>"+textStyle+"</style>";
for (var i=0;i<level[0].length;i++) {
  document.querySelector("#i"+i).value=level[0][i];
}
var innerht='',blockClasses=[],ids="";
textStyle="";
for (var span in paletteIdToPaletteLabel) {
  var ssss=paletteLabelToClassName[paletteIdToPaletteLabel[span]];
  if (ssss.indexOf(' ')>-1) ssss=ssss.slice(0,ssss.indexOf(' '));
  innerht+='<div class="hoverthing '+ssss+'hoverthingTHING"><div class="icon"><div class="'+paletteLabelToClassName[paletteIdToPaletteLabel[span]]+'"></div></div><span class="blkTyp" id="'+span+'">'+paletteIdToPaletteLabel[span]+'</span></div> ';
  blockClasses.push(paletteLabelToClassName[paletteIdToPaletteLabel[span]]);
  ids+=paletteLabelToSymbol[paletteIdToPaletteLabel[span]];
  textStyle+="."+ssss+"hoverthingTHING:hover:after {content:\""+paletteLabelToDesc[paletteIdToPaletteLabel[span]]+"\";}";
}
document.head.innerHTML+="<style>"+textStyle+"</style>";
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
  document.querySelector("#width").innerHTML=level[0].length;
  document.querySelector("#height").innerHTML=level.length;
  document.querySelector(".level").style.width=(level[0].length*40)+"px";
  document.querySelector(".level").style.height=(level.length*40)+"px";
}
render();
document.querySelector("#palette").innerHTML=innerht;
document.querySelector("p").onclick=function(e){
  if (e.target.className=="blkTyp") {
    document.querySelector("#current").innerHTML=paletteIdToPaletteLabel[e.target.id];
    document.querySelector("#curB").className=paletteLabelToClassName[document.querySelector("#current").innerHTML];
  }
}
var mD=false;
document.querySelector(".level").onmousedown=function(e){
  mD=true;
  if (e.target.className.slice(0,10)=="levelBlock") {
    var row=Number(e.target.parentNode.id.slice(1)),col=Number(e.target.id.slice(1));
    // if (!(row==level.length-2&&col==1)) {
      e.target.className="levelBlock "+paletteLabelToClassName[document.querySelector("#current").innerHTML];
      level[row]=level[row].slice(0,col)+paletteLabelToSymbol[document.querySelector("#current").innerHTML]+level[row].slice(col+1);
    // }
  }
}
document.querySelector(".level").onmouseup=function(){mD=false;if(level!=hist[hist.length-1]){hist.push(JSON.parse(JSON.stringify(level)));redoHist=[];}}
document.querySelector(".level").onmouseover=function(e){
  if (e.target.className.slice(0,10)=="levelBlock"&&mD) {
    var row=Number(e.target.parentNode.id.slice(1));
    var col=Number(e.target.id.slice(1));
    // if (!(row==level.length-2&&col==1)) {
      e.target.className="levelBlock "+paletteLabelToClassName[document.querySelector("#current").innerHTML];
      level[row]=level[row].slice(0,col)+paletteLabelToSymbol[document.querySelector("#current").innerHTML]+level[row].slice(col+1);
    // }
  }
}
document.body.onkeydown=function(e){
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
        level[i]+=paletteLabelToSymbol[document.querySelector("#current").innerHTML];
      }
      break;
    case 40:
      if (level.length>3) {
        level.splice(0,1);
      }
      break;
    case 38:
      level.splice(0,0,paletteLabelToSymbol[document.querySelector("#current").innerHTML].repeat(level[0].length));
      break;
  }
  if(level!=hist[hist.length-1]){
    hist.push(JSON.parse(JSON.stringify(level)));
    redoHist=[];
    render();
  }
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
  var texts=[],blankForever=-1;
  for (var i=0;i<10;i++) {
    texts.push("\""+document.querySelector("#i"+i).value+"\"");
    if (document.querySelector("#i"+i).value) blankForever=i;
  }
  texts.splice(blankForever+1);
  if (texts.length) texts="\n"+texts.join(",\n")+"\n";
  else texts="";
  document.querySelector("textarea").value="[["+texts+"],\n\""+level.join("\",\n\"")+"\"\n]";
  document.querySelector("textarea").select();
}
function save() {
  var texts=[],blankForever=-1,danewcode;
  if (typeof level[0]=="object") {
    level.splice(0,1);
  }
  danewcode=level;
  for (var i=0;i<10;i++) {
    texts.push(document.querySelector("#i"+i).value);
    if (document.querySelector("#i"+i).value) blankForever=i;
  }
  texts.splice(blankForever+1);
  danewcode.splice(0,0,texts);
  localStorage.setItem('level',JSON.stringify(danewcode));
}
document.querySelector("#save").onclick=save;
document.querySelector("#doneBit").onclick=function(){
  document.querySelector("textarea").value="[\n  \""+level.join("\",\n  \"")+"\"\n],";
  document.querySelector("textarea").select();
}
document.querySelector("#load").onclick=function(){
  level=JSON.parse(document.querySelector("textarea").value);
  for (var i=0;i<level[0].length;i++) {
    document.querySelector("#i"+i).value=level[0][i];
  }
  render();
}
document.querySelector("#test").onclick=function(){
  save();
  window.location.href='../';
  return false;
}
document.querySelector("#template").onclick=function(){
  if (level.length>6) {
    level.splice(0,level.length-6);
  } else if (level.length<6) {
    var j=level.length;
    for (var i=0;i<6-j;i++) {
      level.splice(0,0,"@".repeat(level[0].length));
    }
  }
  render();
}
document.querySelector("#undo").onclick=function(){
  if (hist.length-1) {
    redoHist.push(hist.pop());
    level=hist[hist.length-1];
    render();
  }
}
document.querySelector("#redo").onclick=function(){
  if (redoHist.length) {
    hist.push(redoHist.pop());
    level=hist[hist.length-1];
    render();
  }
}
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
