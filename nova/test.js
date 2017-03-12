var tempX=-sX%16,tempY=-sY%16,destX,destY,stuff="",color;
destY=Math.floor(sY/16)+360/16+1;
for (var i=Math.floor(sY/16);i<destY;i++) {
  if (i>level.length-1) {break;}
  var t=level[i][0],c=Math.floor(sX/16);
  destX=Math.floor(sX/16)+480/16+1;
  for (var j=c;j<destX;j++) {
    if (t!=level[i][j]) {
      if (t>0) {
        if (t==1) color="#C96D31";
        else color="#5CB712";
        stuff+=renderBlock(color,tempX,tempY,(j-c)*16);
      }
      tempX+=(j-c)*16;
      c=j;
      t=level[i][j];
    }
  }
  if (t>0) {
    if (t==1) color="#C96D31";
    else color="#5CB712";
    stuff+=renderBlock(color,tempX,tempY,(j-c)*16);
  }
  tempX+=(j-c)*16-496;
  tempY+=16;
}
document.querySelector("#stage").innerHTML=stuff;
