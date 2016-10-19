var level=[ /* space=air, @=ground, #=lava */
  "@@@@@@@@@@@@@@@@@+@@",
  "@              @@w@@",
  "@               www@",
  "@   @===@       www@",
  "@     #         www@",
  "@     #        @w@@@",
  "@v^@@###*>><<**@@@@@",
];
var paletteIdToPaletteLabel={
  space:"air",at:"solid",hash:"lava",plus:"destination",carrot:"jumpboost",v:"stickyground",aster:"ice",equals:"mud",w:"water",less:"leftconveyorbelt",great:"rightconveyorbelt",c:"checkpoint",r:"leftfan",l:"rightfan",b:"upfan",amp:"autojumppad",g:"gold",s:"sand",a:"lavatosolidpowerup",backtick:"usedpowerup",i:"liquificationpowerup",p:"pillarpowerup"
},paletteLabelToClassName={
  air:"air",solid:"ground",lava:"lava",destination:"win",jumpboost:"jump topOnly",stickyground:"nojump topOnly",ice:"ice",mud:"mud topOnly",water:"water",leftconveyorbelt:"left topOnly",rightconveyorbelt:"right topOnly",checkpoint:"check topOnly",leftfan:"fanR",rightfan:"fanL",upfan:"fanB",autojumppad:"ajump topOnly",gold:"gold",sand:"sand",lavatosolidpowerup:"antilava topOnly",usedpowerup:"nopower",liquificationpowerup:"liquify topOnly",pillarpowerup:"pillar topOnly"
},paletteLabelToSymbol={
  air:" ",solid:"@",lava:"#",destination:"+",jumpboost:"^",stickyground:"v",ice:"*",mud:"=",water:"w",leftconveyorbelt:"<",rightconveyorbelt:">",checkpoint:"C",leftfan:"R",rightfan:"L",upfan:"B",autojumppad:"&",gold:"g",sand:"s",lavatosolidpowerup:"a",usedpowerup:"`",liquificationpowerup:"i",pillarpowerup:"p"
};
var innerht='',blockClasses=[],ids="";
for (var span in paletteIdToPaletteLabel) {
  innerht+='<span class="blkTyp" id="'+span+'">'+paletteIdToPaletteLabel[span]+'</span> ';
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
  document.querySelector("#width").innerHTML=level[0].length;
  document.querySelector("#height").innerHTML=level.length;
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
    e.target.className="levelBlock "+paletteLabelToClassName[document.querySelector("#current").innerHTML];
    var row=Number(e.target.parentNode.id.slice(1));
    var col=Number(e.target.id.slice(1));
    level[row]=level[row].slice(0,col)+paletteLabelToSymbol[document.querySelector("#current").innerHTML]+level[row].slice(col+1);
  }
}
document.querySelector(".level").onmouseup=function(){mD=false;}
document.querySelector(".level").onmouseover=function(e){
  if (e.target.className.slice(0,10)=="levelBlock"&&mD) {
    e.target.className="levelBlock "+paletteLabelToClassName[document.querySelector("#current").innerHTML];
    var row=Number(e.target.parentNode.id.slice(1));
    var col=Number(e.target.id.slice(1));
    level[row]=level[row].slice(0,col)+paletteLabelToSymbol[document.querySelector("#current").innerHTML]+level[row].slice(col+1);
  }
}
document.body.onkeydown=function(e){
  switch (e.keyCode) {
    case 37:
      if (level[0].length>1) {
        for (var i=0;i<level.length;i++) {
          level[i]=level[i].slice(0,-1);
        }
      }
      break;
    case 39:
      for (var i=0;i<level.length;i++) {
        level[i]+="@";
      }
      break;
    case 40:
      if (level.length>1) {
        level.splice(0,1);
      }
      break;
    case 38:
      level.splice(0,0,"@".repeat(level[0].length));
      break;
  }
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
  document.querySelector("textarea").value="[[],\n\""+level.join("\",\n\"")+"\"\n]";
  document.querySelector("textarea").select();
}
document.querySelector("#doneBit").onclick=function(){
  document.querySelector("textarea").value="[\n  \""+level.join("\",\n  \"")+"\"\n],";
  document.querySelector("textarea").select();
}
document.querySelector("#load").onclick=function(){
  level=JSON.parse(document.querySelector("textarea").value);
  render();
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
