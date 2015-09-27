/**
 * @author Gordon from Blumberg
 * @description Module for rendering
 * @version 0.1.0
 */


define(['GBL'], function (gbl) {
 "use strict";
    var view = {},
        config,
        coords;

    view.name = 'view.js';
    view.version = '0.1.0';

    config = {
        focus: 800,
        hexQuarter: 20,
        hexWidth: 70
    };

    view.View = function View(opts) {
        var coords;
    };

    view.View.prototype = {
        constructor: view.View
    };

});

/*
 bf.Battlefield = function Battlefield(o) {    //на данный момент принимается лишь свойство o.template
 var self=this,
 bW=gbl.round(.8*html[0].clientWidth), bH=gbl.round(.8*html[0].clientHeight),
 depth=250,
 maxDistance=500,
 angleHeight=45,
 angleAzimut=0,
 shift={x:0,y:0},
 pi=Math.PI,
 coefs={},temp, cover;

 this.width=bW=bW>1024?1024:bW;
 this.height=bH=bH>768?768:bH;
 this.allHexes=new bf.HexCollection({type:'all'});

 this.isGridVisible=function() {return isGridVisible};
 this.showGrid=function() {
 isGridVisible=1;
 self.grid[0].style.display='block'
 };
 this.hideGrid=function() {
 isGridVisible=0;
 self.grid[0].style.display='none'
 };
 this.getDepth=function() {return depth};
 this.changeDepth=function(x) {
 var max=gbl.sqrt(gbl.sqr(maxDistance)-gbl.sqr(shift.y*coefs.sina))-2*shift.y*coefs.cosa;
 max=!max?0:max>600?600:max;
 depth+=x;
 depth=(depth<-self.focus/4)?-self.focus/4:(depth>max)?max:depth;
 this.calculateFocusCoords()
 };
 this.getCoefs=function() {return coefs};
 this.getShift=function() {return shift};
 this.changeShift=function(x) {
 var c=self.getCoefs(),maxDepth,
 tr=[c.sinb,c.cosb],
 maxX=self.gridWidth/2,
 maxY=self.gridHeight/2;
 shift.x+=30*Math.pow(-1,(x+2)/2^0)*tr[(x+1)%2];
 shift.y+=30*Math.pow(-1,(x+1)/2^0)*tr[x%2];
 shift.x=shift.x<-maxX?-maxX:shift.x>maxX?maxX:shift.x;
 shift.y=shift.y<-maxY?-maxY:shift.y>maxY?maxY:shift.y;
 maxDepth=gbl.sqrt(gbl.sqr(maxDistance)-gbl.sqr(shift.y*coefs.sina))-2*shift.y*coefs.cosa;
 depth=depth>maxDepth?maxDepth:depth;
 self.calculateFocusCoords()
 };
 this.getAngleHeight=function() {return angleHeight};
 this.changeAngleHeight=function(x) {
 var maxDepth;
 angleHeight+=x;
 angleHeight=(angleHeight<15)?15:(angleHeight>65)?65:angleHeight;
 coefs.sina=Math.sin(pi*angleHeight/180);
 coefs.cosa=Math.cos(pi*angleHeight/180);
 maxDepth=gbl.sqrt(gbl.sqr(maxDistance)-gbl.sqr(shift.y*coefs.sina))-2*shift.y*coefs.cosa;
 depth=depth>maxDepth?maxDepth:depth;
 self.calculateFocusCoords()
 };
 this.getAngleAzimut=function() {return angleAzimut};
 this.changeAngleAzimut=function(x) {
 angleAzimut+=x;
 angleAzimut%=360;
 coefs.sinb=Math.sin(pi*angleAzimut/180);
 coefs.cosb=Math.cos(pi*angleAzimut/180);
 self.calculateFocusCoords();
 self.lastHexes&&self.findLastest()
 };
 this.focusOnHex=function(hex) {     // ** Remove to prototype! **
 var coor=hex.getCoords().center;
 shift.x=coor.x-self.gridWidth/2;
 shift.y=coor.y-self.gridHeight/2;
 self.calculateFocusCoords();
 self.callMethods('calculateCoords');
 self.render()
 };
 this.changeAngleHeight(0);
 this.changeAngleAzimut(0);

 bf.templates.bfCur=this;
 bf.templates.run(o.template);    //template launch

 cover=cE('div',{className:'cover'})
 .insertTo(body)
 .setAttribute('tabindex',-1);
 layers=cE('div',{innerHTML:'<div class="bf-ground scene-3d" style="width:'+(2*self.gridRadius+100)+'px;height:'+(2*self.gridRadius+100)+'px;border-gridRadius:'+(self.gridRadius+50)+'px;background-image:url(images/'+o.groundSrc+')"></div>'})
 .add(cE('div'))
 .addClass('battlefield')
 .insertTo(cover);
 this.scene3d=layers.get(0);

 this.grid=cE('img',{onload:function() {this.loaded=1},src:'images/'+o.gridSrc,id:'grid'});
 setTimeout(this.drawGrid,1000,this);

 this.canvas=cE('canvas',{width:self.gridWidth,height:self.gridHeight});
 this.overLayers=self.grid.add(self.canvas);

 this.cursor=cE('img',{src:'images/cursor.png',width:72,height:82,style:{display:'none'}});
 this.grid.add(self.canvas).add(self.cursor).addClass('bf-ground').insertTo(self.scene3d);

 this.mouseCatcher=layers.get(1);

 this.callMethods('findNeighbors');
 onResize();
 this.findLastest();

 cover[0].onkeydown=onKyDown;
 this.mouseCatcher[0].onmousemove=onMsMove;
 this.mouseCatcher[0].onmouseout=onMsOut;
 window.onresize=onResize;

 function onKyDown(e) {
 var k=e.keyCode;
 if (k<33||k>40||k==35||k==36) return;
 if (e.ctrlKey) {
 switch(k) {
 case 38:
 self.changeAngleHeight(5);
 break;
 case 39:
 self.changeAngleAzimut(5);
 break;
 case 40:
 self.changeAngleHeight(-5);
 break;
 case 37:
 self.changeAngleAzimut(-5);
 break;
 }
 } else {
 switch(k) {
 case 33:
 self.changeDepth(40);
 break;
 case 34:
 self.changeDepth(-40);
 break;
 default:
 self.changeShift(k-37);
 }
 }
 self.callMethods('calculateCoords');
 self.render();
 return false
 }
 function onMsMove(e) {
 e=fixEvent(e);
 self.lx=e.layerX;
 self.ly=e.layerY;
 self.setCurrentHex(e)
 }
 function onMsOut() {
 self.lx=self.ly=null;
 self.currentHex&&self.resetCurrentHex()
 }
 function onResize() {
 var w=self.wall.width,curs=self.cursor;
 bW=gbl.round(.8*html[0].clientWidth);
 bH=gbl.round(.8*html[0].clientHeight);
 self.width=bW=bW>1024?1024:bW;
 self.height=bH=bH>768?768:bH;
 maxDistance=self.focus*(1.5*self.gridHeight/bH-1);
 mGB('.bf-ground').css({
 left:bW/2-self.gridRadius-50+'px',
 top:bH/2-self.gridRadius-50+'px'
 });
 self.overLayers.css({
 left:(bW-self.gridWidth)/2+'px',
 top:(bH-self.gridHeight)/2+'px'
 });
 setStyles();
 curs.css({
 left:(bW-curs[0].width)/2+'px',
 top:(bH-curs[0].height)/2+'px'
 });
 self.calculateFocusCoords();
 self.render();

 function setStyles() {
 var i,css=[],cls=['battlefield','bf-wall','unit'],
 style=[
 '{width:'+bW+'px;height:'+bH+'px;top:'+((html[0].clientHeight-bH)/2^0)+'px;left:'+((html[0].clientWidth-bW)/2^0)+'px}',
 '{width:'+w+'px;height:200px;left:'+((bW-w)/2^0)+'px;top:'+(bH/2-200^0)+'px;background-image:url(images/'+self.wall.src+')}',
 '{left:'+(bW-70)/2+'px;top:'+(bH/2-100)+'px}'
 ];
 for (i=0;i<cls.length;i++) {
 css.push('.'+cls[i],style[i])
 }
 mGB('bf')[0].innerHTML=css.join(' ');
 }
 }
 };

 bf.Battlefield.prototype={
 constructor:bf.Battlefield,
 callMethods:function() {this.allHexes.callMethods(arguments)},
 setCurrentHex:function(e) {
 var lx=e.layerX, ly=e.layerY, scr,x,x1,y,y1,str,coef,th=this,
 f=th.focusCoords;
 scr=th.convertBackCoords(lx,ly,0);
 coef=f.z/(f.z-scr.z);
 y1=coef*(scr.y-f.y)+f.y;
 y=th.maxY-((y1-8)/(3*th.hexQuarter)^0);
 y=y<th.minY-1||y>th.maxY+1?null:y<th.minY?th.minY:y>th.maxY?th.maxY:y;
 if (y===null) return th.resetCurrentHex();
 str=th[y];
 x1=coef*(scr.x-f.x)+f.x;
 x=(x1-y*th.hexWidth/2)/th.hexWidth^0;
 x=x<str.minX-1||x>str.maxX+1?null:x<str.minX?str.minX:x>str.maxX?str.maxX:x;
 if (x===null) return th.resetCurrentHex();
 th.currentHex=str[x].setCurrent()
 },
 resetCurrentHex:function() {
 this.cursor[0].style.display='none';
 this.currentHex&&this.currentHex.resetCurrent();
 this.currentHex=null
 },
 convertCoords:function() {
 var th=this,
 c=th.getCoefs(), args=arguments,x,y,z,sh=th.getShift(),dx=th.gridWidth/2,dy=th.gridHeight/2;
 if (typeof args[0]=='object') x=args[0].x,y=args[0].y,z=args[0].z;
 else x=args[0],y=args[1],z=args[2];
 z=z||0;
 x-=sh.x+dx;
 y-=sh.y+dy;
 return {x:gbl.round(c.cosb*x-c.sinb*y+th.width/2),
 y:gbl.round(c.sina*c.sinb*x+c.sina*c.cosb*y-c.cosa*z+th.height/2),
 z:gbl.round(-c.cosa*c.sinb*x-c.cosa*c.cosb*y-c.sina*z+th.getDepth())
 }
 },
 convertBackCoords:function() {
 var th=this,
 c=th.getCoefs(), args=arguments,x,y,z,sh=th.getShift(),w=th.width/2,h=th.height/2,d=th.getDepth(),
 dx=th.gridWidth/2,dy=th.gridHeight/2;
 if (typeof args[0]=='object') x=args[0].x,y=args[0].y,z=args[0].z;
 else x=args[0],y=args[1],z=args[2];
 x-=w,y-=h,z-=d;
 return {x:gbl.round(c.cosb*x+c.sina*c.sinb*y-c.cosa*c.sinb*z+sh.x+dx),
 y:gbl.round(-c.sinb*x+c.sina*c.cosb*y-c.cosa*c.cosb*z+sh.y+dy),
 z:gbl.round(-c.cosa*y-c.sina*z)}
 },
 projectToScreen:function() {
 var x,y,z,bf=this,args=arguments,
 dx=bf.width/2^0,
 dy=bf.height/2^0,
 f=bf.focus;
 if (typeof args[0]=='object') x=args[0].x,y=args[0].y,z=args[0].z;
 else x=args[0],y=args[1],z=args[2];
 return {x:gbl.round(f*(x-dx)/(z+f)+dx),
 y:gbl.round(f*(y-dy)/(z+f)+dy)
 }
 },
 calculateFocusCoords:function() {this.focusCoords=this.convertBackCoords(this.width/2,this.height/2,-this.focus)},
 render:function() {
 var th=this,
 ah=th.getAngleHeight(),
 az=th.getAngleAzimut(),
 sh=th.getShift(),
 d=th.getDepth(),val;
 val='translateZ('+(-d)+'px) rotateX('+(90-ah)+'deg) rotateZ('+az+'deg) translateX('+(-sh.x)+'px) translateY('+(-sh.y)+'px)';
 mGB('.bf-ground').css({
 webkitTransform:val,
 mozTransform:val,
 oTransform:val,
 transform:val
 });
 th.wall.add(mGB('.sprite')).each(function(el) {
 var val,dx=th.gridWidth/2,dy=th.gridHeight/2,op,coor=th.convertCoords(el.x,el.y),
 zi=th.projectToScreen(coor).y,rotx,roty,rotz,trany,x=el.isSprite;
 op=x?1:coor.z<-300?0:((360+el.angle-az)%360>224&&(360+el.angle-az)%360<316)?.3:1;
 rotx=x?ah/2-90:-90;
 roty=el.reflect?' rotateY(180deg)':'';
 rotz=x?-az:90-el.angle;
 trany=x?' translateY(5px)':'';
 val='translateZ('+(-d)+'px) rotateX('+(90-ah)+'deg) rotateZ('+az+'deg) translateX('+(el.x-sh.x-dx)+'px) translateY('+(el.y-sh.y-dy)+'px) rotateZ('+rotz+'deg)'+trany+' rotateX('+rotx+'deg)'+roty;
 mGB(el).css({
 webkitTransform:val,
 mozTransform:val,
 oTransform:val,
 transform:val,
 opacity:op,
 zIndex:zi
 })
 });
 th.lx!=null&&th.setCurrentHex({layerX:th.lx,layerY:th.ly})
 },
 drawGrid:function(bf) {
 var can=cE('canvas',{width:bf.gridWidth,height:bf.gridHeight}).insertTo(body),
 ctx=can[0].getContext('2d'),i,grid=bf.grid[0];
 for (i=0;i<bf.allHexes.all.length;i++) {
 if (grid.loaded) return can.remove();
 bf.allHexes.all[i].drawGrid(ctx)
 }
 grid.src=can[0].toDataURL();
 can.remove();
 },
 findLastest:function() {
 var i,lh=this.lastHexes,
 all=lh.all;
 lh.left=lh.right=lh.close=lh.far=all[0];
 for (i=0;i<all.length;i++) {
 lh.left=lh.left.getCoorForRender().center.x>all[i].getCoorForRender().center.x?all[i]:lh.left;
 lh.right=lh.right.getCoorForRender().center.x<all[i].getCoorForRender().center.x?all[i]:lh.right;
 lh.close=lh.close.getCoorAboutScreen().center.z>all[i].getCoorAboutScreen().center.z?all[i]:lh.close;
 lh.far=lh.far.getCoorAboutScreen().center.z<all[i].getCoorAboutScreen().center.z?all[i]:lh.far
 }
 lh.minX=lh.left.getCoorForRender().center.x;
 lh.maxX=lh.right.getCoorForRender().center.x;
 lh.minZ=lh.close.getCoorAboutScreen().center.z;
 lh.maxZ=lh.far.getCoorAboutScreen().center.z
 }
 };

 Hex=function Hex(x,y) {
 var self=this,
 bfCur=bf.templates.bfCur,
 xStart=bfCur.coordsOfStart.x,
 yStart=bfCur.coordsOfStart.y,
 q=bfCur.hexQuarter,
 w=bfCur.hexWidth,
 coords={
 top:{
 x:xStart+x*w+(y+1)*w/2^0,
 y:yStart-y*3*q
 },
 leftTop:{
 x:xStart+x*w+y*w/2^0,
 y:yStart-y*3*q+q
 },
 leftBottom:{
 x:xStart+x*w+y*w/2^0,
 y:yStart-(y-1)*3*q
 },
 bottom:{
 x:xStart+x*w+(y+1)*w/2^0,
 y:yStart-(3*y-4)*q
 },
 rightBottom:{
 x:xStart+(x+1)*w+y*w/2^0,
 y:yStart-(y-1)*3*q
 },
 rightTop:{
 x:xStart+(x+1)*w+y*w/2^0,
 y:yStart-y*3*q+q
 },
 center:{
 x:xStart+x*w+(y+1)*w/2^0,
 y:yStart-y*3*q+2*q
 }
 },
 coorAboutScreen={},
 coorForRender={};
 this.x=x;
 this.y=y;
 this.getCoords=function() {return coords};
 this.calculateCoords=function() {
 var bfCur=bf.templates.bfCur;
 gbl.forOwn(coords,function(p) {
 coorAboutScreen[p]=bfCur.convertCoords(coords[p]);
 coorForRender[p]=bfCur.projectToScreen(coorAboutScreen[p])
 });
 self.isFar=coorAboutScreen.center.z>850?1:0;
 self.isClose=coorAboutScreen.center.z<300?1:0;
 self.isTooClose=coorAboutScreen.center.z<-50?1:0;
 };
 this.getCoorAboutScreen=function() {return coorAboutScreen};
 this.getCoorForRender=function() {return coorForRender};
 this.calculateCoords();
 bfCur.allHexes.push(this);
 };
 Hex.prototype={
 constructor:Hex,
 coorShifts:[[0,1],[1,0],[1,-1],[0,-1],[-1,0],[-1,1]],
 findNeighbors:function() {
 var bfCur=bf.templates.bfCur,x=this.x,y=this.y;
 this[0]=bfCur[y][x+1]?bfCur[y][x+1]:null;
 this[1]=bfCur[y+1]&&bfCur[y+1][x]?bfCur[y+1][x]:null;
 this[2]=bfCur[y+1]&&bfCur[y+1][x-1]?bfCur[y+1][x-1]:null;
 this[3]=bfCur[y][x-1]?bfCur[y][x-1]:null;
 this[4]=bfCur[y-1]&&bfCur[y-1][x]?bfCur[y-1][x]:null;
 this[5]=bfCur[y-1]&&bfCur[y-1][x+1]?bfCur[y-1][x+1]:null;
 this.isLast=(this[0]&&this[1]&&this[2]&&this[3]&&this[4]&&this[5])?0:1;
 if (this.isLast) {
 if (!bfCur.lastHexes) bfCur.lastHexes=new bf.HexCollection({bfCur:bfCur,type:'last'});
 bfCur.lastHexes.push(this)
 }
 },
 drawGrid:function(ctx) {
 var c=this.getCoords();
 ctx.beginPath();
 ctx.moveTo(c.top.x,c.top.y);
 ctx.lineTo(c.leftTop.x,c.leftTop.y);
 ctx.lineTo(c.leftBottom.x,c.leftBottom.y);
 ctx.lineTo(c.bottom.x,c.bottom.y);
 ctx.lineTo(c.rightBottom.x,c.rightBottom.y);
 ctx.lineTo(c.rightTop.x,c.rightTop.y);
 ctx.lineTo(c.top.x,c.top.y);
 ctx.lineWidth=2;
 ctx.strokeStyle='rgba(104,140,0,1)';
 ctx.closePath();
 ctx.stroke()
 },
 drawCursor:function() {
 var ctx=this.ctxCursor;
 if (!this.isVisible) return;
 ctx.beginPath();
 ctx.lineWidth=2+this.isClose-this.isFar+this.isTooClose;
 ctx.strokeStyle=currentBattlefield.isGridVisible()?'rgba(160,160,0,.8)':'rgba(50,50,50,.5)';
 ctx.fillStyle='rgba(50,50,50,.5)';
 this.drawHex(ctx);
 ctx.fill();
 ctx.stroke();
 this.isCurrent=1;
 return this;
 },
 setCurrent:function() {
 var bfCur=bf.templates.bfCur,c=this.getCoords().center,
 d=bfCur.getDepth(),ah=bfCur.getAngleHeight(),az=bfCur.getAngleAzimut(),sh=bfCur.getShift(),
 dx=bfCur.gridWidth/2,dy=bfCur.gridHeight/2,
 val='translateZ('+(-d)+'px) rotateX('+(90-ah)+'deg) rotateZ('+az+'deg) translateX('+(c.x-dx-sh.x)+'px) translateY('+(c.y-dy-sh.y)+'px)';
 this.isCurrent=1;
 bfCur.cursor.css({
 webkitTransform:val,
 mozTransform:val,
 oTransform:val,
 transform:val,
 display:'inline-block'
 });
 return this
 },
 resetCurrent:function() {
 this.isCurrent=0
 }
 };

 */