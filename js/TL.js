/* 删除数组指定项 */
Array.prototype.findindexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].uuid == val) return i;
    }
    return -1;
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