class Collidable {
  constructor(width,height,isTileSolidFunction) {
    this.width=width;
    this.height=height;
    this.tile=isTileSolidFunction;
    this.x=this.y=this.xv=this.yv=0;
  }
  updateVelocities() {
    var x=this.x,y=this.y,xv=this.xv,yv=this.yv,WIDTH=this.width,HEIGHT=this.height,
    ceil=Math.ceil,floor=Math.floor,abs=Math.abs,round=Math.round,
    checks=[],
    xrange=xv>0 ? ceil(x+WIDTH+xv)-ceil(x+WIDTH) :xv<0 ? floor(x)-floor(x+xv) :0,
    offsetx=xv>0 ? ceil(x+WIDTH)-x-WIDTH :xv<0 ? floor(x)-x :0,
    xcollided=x+WIDTH+xv<=ceil(x+WIDTH)&&x+xv>=floor(x),
    yrange=yv>0 ? ceil(y+HEIGHT+yv)-ceil(y+HEIGHT) :yv<0 ? floor(y)-floor(y+yv) :0,
    offsety=yv>0 ? ceil(y+HEIGHT)-y-HEIGHT :yv<0 ? floor(y)-y :0,
    ycollided=y+HEIGHT+yv<=ceil(y+HEIGHT)&&y+yv>=floor(y);
    for (var i=0,t;i<xrange;i++) {
      t=i*(xv>0 ? 1 :xv<0 ? -1 :0)+offsetx;
      checks.push([t,xv===0?0:t/xv*yv,2]);
    }
    for (var i=0,t;i<yrange;i++) {
      t=i*(yv>0 ? 1 :yv<0 ? -1 :0)+offsety;
      if ((()=>{
        for (var j=0;j<checks.length;j++) if (checks[j][1]===t) {
          checks[j][2]*=3;
          return false;
        }
        return true;
      })()) checks.push([yv===0?0:t/yv*xv,t,3]);
    }
    checks.sort((a,b)=>a[0]===b[0]?abs(a[1])-abs(b[1]):abs(a[0])-abs(b[0]));
    for (var i=0;i<checks.length;i++) {
      if (!xcollided&&checks[i][2]%2===0) {
        if (this.checkTilesX(
          xv>0 ? round(x+WIDTH+checks[i][0]) :xv<0 ? round(x+checks[i][0])-1 :floor(x),
          ycollided?y+yv:y+checks[i][1]
        )) xv=checks[i][0],xcollided=true;
      }
      if (!ycollided&&checks[i][2]%3===0) {
        if (this.checkTilesY(
          xcollided?x+xv:x+checks[i][0],
          yv>0 ? round(y+HEIGHT+checks[i][1]) :yv<0 ? round(y+checks[i][1])-1 :floor(y)
        )) yv=checks[i][1],ycollided=true;
      }
      if (xcollided&&ycollided) break;
    }
    this.xv=xv,this.yv=yv;
  }
  updatePositions() {
    this.x+=this.xv,this.y+=this.yv;
  }
  checkTilesX(x,y) {
    var stop=Math.ceil(y+this.height);
    for (var i=Math.floor(y);i<stop;i++) if (this.tile(x,i)) return true;
    return false;
  }
  checkTilesY(x,y) {
    var stop=Math.ceil(x+this.width);
    for (var i=Math.floor(x);i<stop;i++) if (this.tile(i,y)) return true;
    return false;
  }
}
