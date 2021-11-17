/* 删除数组指定项 */
Array.prototype.findindexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].uuid == val) return i;
    }
    return -1;
};

Array.prototype.unique=function(){

    var arr=[];//新建一个临时数组

    for(var i=0;i<this.length;i++){//遍历当前数组
        console.log(i,this[i]);
        let flag = new Boolean(true);
        for (let j = 0 ;j<arr.length;j++){
            if(Math.abs(arr[j].CrossPoint[0].x - this[i].CrossPoint[0].x)<0.01){
                flag=false;console.log(flag);break;
            }
        }
        if(flag)arr.push(this[i]);
    }

    console.log(arr);
    return arr;
};
function TowerPRKIndex (prk,val){
    for (let i = 0; i < prk.TOWER.length; i++) {
        if(prk.TOWER[i].Name == val){return i;break;}
    }
}

Array.prototype.removed = function(val) {
    var index = this.findindexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
/*禁止右键菜单*/
function blockContextmen(){
    if(window.event){
        window.event.returnValue=false;
    }
}
/* 比较排序 */
function compare(property){
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}

//sinh arcsh函数
function sinh(x) {
    let a = (Math.exp(x) - Math.exp(-x))/2;
    return a;
}
function arcsh(x) {
    let a = Math.log(x + Math.sqrt(x * x +1));
    return a;
}
//求最近值
function limit(arr, num){
    var newArr = [];
    arr.map(function(x){
        // 对数组各个数值求差值
        newArr.push(Math.abs(x - num));
    });
    // 求最小值的索引
    var index = newArr.indexOf(Math.min.apply(null, newArr));
    return arr[index];
}
//transform coordination to Geographic system
function Line2Geo(pilelist,towerlist){
    console.log(towerlist.length);
    let pileInd = 0;let towInd = 0;
    let plen = pilelist.length; let tlen = towerlist.length;
    while(towInd<tlen){
        for(let i = pileInd; i<plen;i++){
            if(Math.abs(towerlist[towInd].Distance-pilelist[i].dist)<0.005) {
                // piledata  index ++  break
              // var res = {towInd:towInd,x:pilelist[i].x,y:pilelist[i].y};
              towerlist[towInd].GX = pilelist[i].x; towerlist[towInd].GY = pilelist[i].y
              pileInd = i;
              towInd++;
              break;
            }
            if(towerlist[towInd].Distance<pilelist[i].dist){
                pileInd = i-1 ;
                var rate=(towerlist[towInd].Distance-pilelist[pileInd].dist)/(pilelist[pileInd+1].dist-pilelist[pileInd].dist);
                var dx = pilelist[pileInd+1].x-pilelist[pileInd].x;
                var dy = pilelist[pileInd+1].y-pilelist[pileInd].y;
                // var res = {towInd:towInd,x:pilelist[pileInd].x+dx*rate,y:pilelist[pileInd].y+dy*rate}
                // console.log("pilecoord",pilelist[pileInd],pilelist[pileInd+1]);
                // console.log(towerlist[towInd].Distance-pilelist[pileInd].dist,pilelist[pileInd+1].dist-pilelist[pileInd].dist,
                //     dx,dy)
                // console.log(res);
                towerlist[towInd].GX = pilelist[pileInd].x+dx*rate; towerlist[towInd].GY = pilelist[pileInd].y+dy*rate;
                towInd++;
                break;
            }
        }
    }
}

//  point =  {"x": 1 , "y":1, "z":1}
function WebMercatorToSumDHigh(point,pilelist,index){
    //point in section
    let MapCoord={x:0,y:0};
    for(let i = 0 ; i < index ; i++) {
        MapCoord.x +=Math.sqrt(Math.pow((pilelist[i+1].x-pilelist[i].x),2)+Math.pow((pilelist[i+1].y-pilelist[i].y),2));
    }
    /* point x  y   pilelist[index] x y  pilelist[index+1] x y
     ∆y = │AXo＋BYo＋C│／√（A²＋B²）∆x =
     cos∠a=[(x2-x1)(x3-x1)+(y2-y1)(y3-y1)]/|ab||ac|
     */
    console.log(index);
    dy =  patch_line_point(point.x,point.y,pilelist[index].x,pilelist[index].y,pilelist[index+1].x,pilelist[index+1].y);
    dx =  Math.sqrt(Math.pow((point.x-pilelist[index].x),2)+Math.pow((pilelist[index].y-point.y),2)- dy*dy);
    MapCoord.x += dx ; MapCoord.y = dy;  // dy  left right
    return MapCoord;
}

function patch_line_point( x , y , line_x1 ,line_y1 , line_x2 ,line_y2 ) {
    let x1 = line_x1, y1 = line_y1, x2 = line_x2, y2 = line_y2, x3 = x, y3 = y;
    let px = x2 - x1;
    let py = y2 - y1;
    let som = px * px + py * py;
    let dist = ((y1 - y3)* px + (x3 - x1)  * py )/ Math.sqrt(som);
    return dist;
}

function SysCrossTransToMap(cross,pilelist){
    let MapCrossObject = {};
    MapCrossObject.CrossPoint = [];
    MapCrossObject.PointCount = cross.PointCount;
    let pileIndex = CrosspileIndex(cross,pilelist);
    for(let i = 0; i < cross.PointCount ; i++){
        console.log("pilecrossIndex",pileIndex);
        MapCrossObject.CrossPoint.push(WebMercatorToSumDHigh(cross.CrossPoint[i],pilelist,pileIndex));
    }
    for(let i = 0; i < cross.PointCount ; i++){
        MapCrossObject.CrossPoint[i].c=1;
        MapCrossObject.CrossPoint[i].dc=0;
        MapCrossObject.CrossPoint[i].dz=0;
        MapCrossObject.CrossPoint[i].z=0;
        MapCrossObject.CrossPoint[i].towerHigh=0;
    }
    cross.CrossPoint = MapCrossObject.CrossPoint ;
    cross.PointCount = MapCrossObject.PointCount ;
    return cross;
}

function CrosspileIndex(cross,pilelist){
    //找到第一跨越分段
    for(let i = 0 ; i < cross.CrossPoint.length-1;i++){
        for(let j = 0;j<pilelist.length-1;j++){
            //line  cross ab   pile section cd
            let b = is_xiangjiao(cross.CrossPoint[i],cross.CrossPoint[i+1],pilelist[j],pilelist[j+1]);
            // let l1 = patch_line_point(cross.CrossPoint[i].x,cross.CrossPoint[i].y,pilelist[j].x,pilelist[j].y,pilelist[j+1].x,pilelist[j+1].y);
            // let l2 = patch_line_point(cross.CrossPoint[i+1].x,cross.CrossPoint[i+1].y,pilelist[j].x,pilelist[j].y,pilelist[j+1].x,pilelist[j+1].y);
            // let l3 = patch_line_point(pilelist[j].x,pilelist[j].y,cross.CrossPoint[i].x,cross.CrossPoint[i].y,cross.CrossPoint[i+1].x,cross.CrossPoint[i+1].y);
            // let l4 = patch_line_point(pilelist[j+1].x,pilelist[j+1].y,cross.CrossPoint[i].x,cross.CrossPoint[i].y,cross.CrossPoint[i+1].x,cross.CrossPoint[i+1].y);
            console.log("CrossPile index",b);
            if(b==true) return j;
        }
    }
    return 0;
}

function is_xiangjiao(a, b, c, d) {
    if(Math.max(c.x,d.x)<Math.min(a.x,b.x)||Math.max(a.x,b.x)<Math.min(c.x,d.x)||Math.max(c.y,d.y)<Math.min(a.y,b.y)||Math.max(a.y,b.y)<Math.min(c.y,d.y))
        return false;
    if(((d.x-a.x)*(d.y-c.y)-(d.y-a.y)*(d.x-c.x))*((d.x-b.x)*(d.y-c.y)-(d.y-b.y)*(d.x-c.x))>0.000000001)
        return false;
    if(((c.x-a.x)*(b.y-a.y)-(c.y-a.y)*(b.x-a.x))*((d.x-a.x)*(b.y-a.y)-(d.y-a.y)*(b.x-a.x))>0.000000001)
        return false;
    return true;
}

function CrossAddCrossPoint(cross){
    let len = cross.CrossPoint.length;
    for(let i = 0 ;i<len-1 ; i++){
        if(cross.CrossPoint[i].y*cross.CrossPoint[i+1].y<0){
            let addCross = {c:1,dc:0,dz:0,towerHigh:0,x:0,y:0,z:0};
            addCross.c=1;
            addCross.dc=0;
            addCross.dz=0;
            addCross.towerHigh = 0;
            addCross.x= CaculateXZeroY(cross.CrossPoint[i].x,cross.CrossPoint[i].y,cross.CrossPoint[i+1].x,cross.CrossPoint[i+1].y);
            addCross.y = 0;
            addCross.z=0;
            cross.CrossPoint.splice(i,0,addCross);
            cross.PointCount++;
           console.log( CaculateXZeroY(cross.CrossPoint[i].x,cross.CrossPoint[i].y,cross.CrossPoint[i+1].y,cross.CrossPoint[i+1].y) );
        }
    }
    return  cross;
}

function CaculateXZeroY(x1,y1,x2,y2){
    let resX = 0;
    console.log(x1,y1,x2,y2);
    resX = -y1*(x2-x1)/(y2-y1)+x1;
    return resX;
}
