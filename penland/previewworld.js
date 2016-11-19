document.querySelector('body > p').innerHTML+=' <button id="previewbutton">Preview world</button>';
document.body.innerHTML+='<canvas id="preview" width="300" height="200">A preview of the Penland world</canvas>';
document.querySelector('#preview').style.display='none';
document.querySelector('#previewbutton').onclick=function(){
  clearInterval(loop);
  document.querySelector("#cover").style.cursor="none";
  pausd=true;
  document.querySelector('#preview').style.display='block';
  if (document.querySelector('#preview').getContext) {
    var c=document.querySelector('#preview').getContext('2d');
    void c.clearRect(0,0,300,200);
    var pixelId=c.createImageData(1,1);
    var pixelData=pixelId.data;
    function pixel(color,x,y) { // http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
      function hexToRgb(hex) { // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }
      var rgb=hexToRgb(color);
      pixelData[0]=rgb.r;
      pixelData[1]=rgb.g;
      pixelData[2]=rgb.b;
      pixelData[3]=255;
      c.putImageData(pixelId,x,y);
    }
    for (var i=0;i<200;i++) {
      for (var j=0;j<300;j++) pixel(blockData[level[i][j]].back,j,199-i);
    }
    // pixel('673AB7',(x+240)/16,(y+180)/16);
    // pixel('673AB7',(x+240)/16,(y+180)/16+1);
  }
};
