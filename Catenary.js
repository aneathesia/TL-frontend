/* 悬链线相关函数 */
window.ComputeLoad = function() {
    var a0=1;							//风压不均匀系数
    var p=1.2255;						//空气密度 ρ
    var g=9.80665;						//重力加速度 ｍ/ｓ^2
    var Usc = 1.0;						//体型系数
    var B =   1.0;						//覆冰时风荷载增大系数
    var Uz =  1.0;						//风速高度变化系数
    var Bc =  1.0;						//风荷载调整系数βc

    for (let i = 0; i < theWeather.num; i++) {
        let v = theWeather.TWI[i].v; //风速
        let b = theWeather.TWI[i].b; //覆冰
        //体型系数取值
        if (b>0 || theLine.d < 17.0){
            Usc = 1.2;
        }
        else {Usc = 1.1;}

        //风速高度变化系数取值
        if (i == 3){
            Uz = Math.pow(theWeather.h / 10, theWeather.alfa * 2);
        }else {
            Uz = 1;
        }

        //覆冰时风荷载增大系数取值
        if (b==5) B = 1.1;
        else if (b ==10) B = 1.2;
        else if (b == 15) B = 1.3;
        else if (b >= 20) B = 1.5;
        else B = 1;

        //风压不均匀系数及风荷载调整系数取值
        if (designLine ==1){
            if (v<20) a0 =1;
            else if (v >= 20&&v<27) a0 = 0.85;
            else if (v>= 27&&v<31.5) a0 = 0.75;
            else a0 = 0.70;
        }
        else if(designLine == 0){
            if (v<20) a0 =1;
            else if (v >= 20&&v<27) a0 = 0.75;
            else if (v>= 27) a0 = 0.61;
        }
        else if (designLine > 10){
            if(designLine<=200)
                a0 = 0.80;
            else if(designLine>200 && designLine<=250)
                a0= 0.80 -(designLine-200)/50*(0.80-0.74);
            else if(designLine>250 && designLine<=300)
                a0 =0.74 -(designLine-250)/50*(0.74-0.70);
            else if(designLine >300 && designLine<=350)
                a0 =0.70 -(designLine-300)/50*(0.70-0.67);
            else if(designLine >350 && designLine<=400)
                a0 =0.67 -(designLine-350)/50*(0.67-0.65);
            else if(designLine >400 && designLine<=450)
                a0 =0.65 -(designLine-400)/50*(0.65-0.63);
            else if(designLine >450 && designLine<=500)
                a0= 0.63 -(designLine-450)/50*(0.63-0.62);
            else if(designLine >500 && designLine<550)
                a0 =0.62 -(designLine-500)/50*(0.62-0.61);
            else if(designLine >=550)
                a0 = 0.61;
        }

        theWeather.TWI[i].P1 = theLine.p1*g;										//自荷载
        theWeather.TWI[i].P2 = 0.9*Math.PI*b*(b+theLine.d)*g*1E-3;						//冰荷载
        theWeather.TWI[i].P3 = theWeather.TWI[i].P1+theWeather.TWI[i].P2;			//自荷载加冰荷载
        theWeather.TWI[i].P4 = a0*v*v/1600*Uz*Usc*Bc*theLine.d ;					//无冰风荷载
        theWeather.TWI[i].P5 = a0*v*v/1600*Uz*Usc*Bc*(theLine.d+2*b)*B;			//覆冰时风荷载
        theWeather.TWI[i].P6 = Math.sqrt(theWeather.TWI[i].P1 * theWeather.TWI[i].P1 + theWeather.TWI[i].P4 * theWeather.TWI[i].P4);							//无冰时综合荷载
        theWeather.TWI[i].P7 = Math.sqrt(theWeather.TWI[i].P3 * theWeather.TWI[i].P3 + theWeather.TWI[i].P5 * theWeather.TWI[i].P5);
        theWeather.TWI[i].angle = Math.atan(theWeather.TWI[i].P5/theWeather.TWI[i].P3);	//风偏角的弧度值
        theWeather.TWI[i].angle = theWeather.TWI[i].angle/Math.PI *180.0;				//风偏角的度数值βο
    }
}
window.initializeData = function(UseWeather,UseLine,u,lineDesign){
    theWeather = UseWeather;
    theLine =    UseLine;
    if (theLine.type!= 0){
        // theWeather.TWI[4].b = theWeather.TWI[4].b + prk.PRIMARY.dIce;(出错地点）
        theWeather.TWI[4].b = 5 + prk.PRIMARY.dIce;
    }
    theLine.F = theLine.F/u;
    theLine.S_p = theLine.Tp*theLine.k/theLine.A;
    theLine.S_m = theLine.S_p/theLine.F;
    theLine.S_a = theLine.S_p * theLine.C;

    theWeather.h = prk.PRIMARY.windH;
    theWeather.alfa =prk.PRIMARY.alfa;

    designLine = lineDesign;
    ComputeLoad();
}
window.FindUsingSection = function(x) {
    x= x+5;
    for(let i=0;i<prk.SECTION.length;i++)
    {
        if(x>=prk.SECTION[i].from && x<=prk.SECTION[i].to)
            return i;
    }
    return -1;
}
window.FindUsingLine = function(i) {
    for(let j=0;i >-1 && j<prk.CONDUCTOR.length;j++)
    {
        if(prk.SECTION[i].powerLine==prk.CONDUCTOR[j].name)
            return j;
    }
    return -1;
}
window.FindUsingGLine = function(i) {
    for(let j=0;i >-1 && j<prk.CONDUCTOR.length;j++)
    {
        if(prk.SECTION[i].groundLine==prk.CONDUCTOR[j].name)
            return j;
    }
    return -1;
}
window.FindUsingWeather = function(i) {
    for(let j=0;i >-1 && j<prk.WEATHER.length;j++)
    {
        if(prk.SECTION[i].wertherName == prk.WEATHER[j].name)
            return j;
    }
    return -1;
}
window.FindTower = function(tower){
    for(let i=0;i<prk.TOWER.length;i++)
    {
        if(tower.TowerType==prk.TOWER[i].Name
            && tower.TowerHigh>=prk.TOWER[i].StartHigh && tower.TowerHigh<=prk.TOWER[i].EndHigh)
            return i;
    }
    return -1;
}
window.initializeDataBool = function(x,u,isPower,designLine){
    UseLine = prk.CONDUCTOR[0];
    UseWeather = prk.WEATHER[0];
    section = prk.SECTION[0];
    let l = 0,w=0,gl = 0,SectionNo = 0;
    SectionNo = FindUsingSection(x);
    if (SectionNo <0) return false;
    section = prk.SECTION[SectionNo];
    if (isPower){
        l = FindUsingLine(SectionNo);
        if(l<0)	return false;
        UseLine = prk.CONDUCTOR[l];
        UseLine.k = section.pLineK;
        UseLine.F = section.pLineF;
        UseLine.C = section.pLineC;
    }
    else {
        l = FindUsingGLine(SectionNo);
        if(l<0) return false;
        UseLine = prk.CONDUCTOR[l];
        UseLine.k = section.gLineK;
        UseLine.F = section.gLineF;
        UseLine.C = section.gLineC;
    }

    w = FindUsingWeather(SectionNo);
    if(w<0) return false;
    UseWeather = prk.WEATHER[w];

    initializeData(UseWeather,UseLine,u,designLine);
    return true;
}
window.GetCtlCondition = function(l) {
    let ctrl;
    let max_Fmx = -99999999;
    for (let i = 0; i < theWeather.num && i < 5; i++) {
        if (i === 0){
            theWeather.TWI[i].Fmx = theLine.E * Math.pow(theWeather.TWI[i].P7/theLine.A * l,2)/(24*Math.pow(theLine.S_a,2)) - theLine.S_a - theLine.a * theLine.E * theWeather.TWI[i].t;
        }else {
            theWeather.TWI[i].Fmx = theLine.E * Math.pow(theWeather.TWI[i].P7/theLine.A * l,2.0) / (24.0*Math.pow(theLine.S_m,2.0)) - theLine.S_m - theLine.a*theLine.E* theWeather.TWI[i].t;
        }

        if(theWeather.TWI[i].Fmx>max_Fmx)							//获取当前代表档距下的控制条件
        {
            max_Fmx = theWeather.TWI[i].Fmx;
            ctrl = i;
        }
    }
    return ctrl;
}
window.GetStrain = function(l,cosa,condition) {
    let S = 0;
    let ctrl = GetCtlCondition(l);
    let b,d;
    let Sm,rm,r,E,a;
    if (ctrl == condition){return ctrl == 0?theLine.S_a:theLine.S_m;}
    if (ctrl == 0){Sm = theLine.S_a;}
    else Sm = theLine.S_m;
    rm = theWeather.TWI[ctrl].P7/theLine.A;
    E = theLine.E;
    a = theLine.a;
    r = theWeather.TWI[condition].P7/theLine.A;
    b = Sm - rm*rm*l*l*E*Math.pow(cosa,3)/(24*Sm*Sm) + a*E*cosa*(theWeather.TWI[ctrl].t - theWeather.TWI[condition].t);
    d = r*r*l*l*E*Math.pow(cosa,3)/24;
    S = GetEquationValue(1,-b,0,-d,9999);
    return S;
}
window.GetEquationValue = function(a,b,c,d,maxX) {
    let A,B,C,delta;
    let x0=0,x1,x2,x3;
    let zero = 1E-4;
    A = b*b-3.0*a*c;
    B = b*c -9.0*a*d;
    C = c*c - 3.0*b*d;
    delta = B*B - 4*A*C;
    if(Math.abs(A-B)<zero && Math.abs(A)<zero)
        x0 = -b/3.0/a;
    else if(Math.abs(delta)<zero)
    {
        let K;
        K = B/A;
        x1 = -b/a+K;
        x2 = -K/2.0;

        if(x1>0 && x1<=maxX)
            x0 = x1;
        else if(x2>0 && x2<=maxX)
            x0 = x2;
    }
    else if(delta>0)
    {
        let Y1,Y2;
        Y1 = A*b + 3.0*a*(-B+Math.sqrt(delta))/2.0;
        Y2 = A*b + 3.0*a*(-B-Math.sqrt(delta))/2.0;
        let t1 = Math.pow( Math.abs(Y1) ,1.0/3.0 );
        let t2 = Math.pow( Math.abs(Y2) ,1.0/3.0 );
        if(Y1<0) t1 = -t1;
        if(Y2<0) t2 = -t2;
        x0 = ( -b-t1-t2 ) / (3.0*a);

    }
    else if(delta<0)
    {
        let sita,T;
        T = (2.0*A*b-3.0*a*B) / (2.0*Math.pow(A,3.0/2.0));
        sita = Math.acos(T);
        x1 = ( -b-2.0*Math.sqrt(A)*Math.cos(sita/3.0) )/3.0/a;
        x2 = ( -b+Math.sqrt(A)*(Math.cos(sita/3.0)+Math.sqrt(3.0)*Math.sin(sita/3.0)) ) /(3.0*a) ;
        x3 = ( -b+Math.sqrt(A)*(Math.cos(sita/3.0)-Math.sqrt(3.0)*Math.sin(sita/3.0)) ) /(3.0*a) ;
        if(x1>0 && x1<=maxX)
            x0 = x1;
        else if(x2>0 && x2<=maxX)
            x0 = x2;
        else if(x3>0 && x3<=maxX)
            x0 = x3;
    }
    return x0 ;
}
window.GetMaxK = function(l,cosa,currentConditon) {
    let ctrl = GetCtlCondition(l) ;
    let S;let max_K = -99999999;
    for (let i = 0; i < 5; i++) {
        S = GetStrain(l,cosa,i);
        if (theWeather.TWI[i].P7 / (2.0*S*theLine.A) >max_K){
            currentConditon = i;
            max_K = theWeather.TWI[i].P7 / (2.0*S*theLine.A);
        }
    }
    return max_K;
}
window.GetMinK = function(l,cosa,currentConditon){
    let ctrl = GetCtlCondition(l);								//控制条件序号
    let S;													//应力
    let min_K = 99999999;									//最大K值
    for(let j = 0;j<5;j++)										//气象条件下的电线应力（力学计算P118）
    {
        S = GetStrain(l,cosa,j);								//计算应力
        if(theWeather.TWI[j].P7 / (2.0*S*theLine.A) <min_K)
        {
            currentConditon = j;
            min_K = theWeather.TWI[j].P7 / (2.0*S*theLine.A);
        }
    }
    return min_K;
}
window.GetLoad = function(condition,no) {
    if(no==1)
        return theWeather.TWI[condition].P1;
    else if(no==2)
        return theWeather.TWI[condition].P2;
    else if(no==3)
        return theWeather.TWI[condition].P3;
    else if(no==4)
        return theWeather.TWI[condition].P4;
    else if(no==5)
        return theWeather.TWI[condition].P5;
    else if(no==6)
        return theWeather.TWI[condition].P6;
    else if(no==7)
        return theWeather.TWI[condition].P7;
    else
        return 0;
}
window.FindInsulate = function(insulateName) {
    if(insulateName=="")
        return -1;
    for(let i=0;i<prk.INSULATE.length;i++)
    {
        if(insulateName==prk.INSULATE[i].name)
            return i;
    }
    return -1;
}
window.GetDown2Top = function(towerType) {
    for(let i=0;i<prk.TOWER.length;i++)
    {
        if(prk.TOWER[i].Name==towerType)
            return prk.TOWER[i].upToMid+prk.TOWER[i].upToTop+prk.TOWER[i].minToDown;
    }
    return 0;
}
window.ComputeHugeHigh = function() {
    for (let i = m_start; i <= m_end; i++) {
        let down2top = GetDown2Top(towerlist[i].TowerType);
        //计算杆塔的悬点高程
        if(towerlist[i].Status==0)
            towerlist[i].hugeHigh = towerlist[i].High + towerlist[i].Base + towerlist[i].TowerHigh - towerlist[i].InsulatorLength;
        else
            towerlist[i].hugeHigh = towerlist[i].High + towerlist[i].Base + towerlist[i].TowerHigh ;
        //地线悬点高
        towerlist[i].hugeGround = towerlist[i].High + towerlist[i].Base + towerlist[i].TowerHigh + down2top;
    }

    ComputeLk();
    ComputeK2();
    ComputeLhLv();
    ComputeGK2();
}
window.ComputeLk = function() {
    let start,end;//耐张段起始转角，终止转角
    let l,x,y,cosb,length,t,cosBk;
    start = m_start;
    end = m_end;
    while (start < m_end){
        end = start + 1;
        if (end < 0) end = m_end;

        length = 0; x = 0; y = 0; t = 0;
        for (let i = start; i < end; i++) {
            length += (towerlist[i+1].Distance - towerlist[i].Distance);//towerlist l2
            cosb = Math.cos(Math.atan((towerlist[i+1].hugeHigh - towerlist[i].hugeHigh)/(towerlist[i+1].Distance - towerlist[i].Distance)));
            t += (towerlist[i+1].Distance - towerlist[i].Distance)/cosb/cosb;
            x += Math.pow((towerlist[i+1].Distance - towerlist[i].Distance),3) * Math.pow(cosb,2);
            y += (towerlist[i+1].Distance - towerlist[i].Distance)/cosb;
        }
        cosBk = y/t;
        if (end - start >1) l = Math.sqrt(x/y) / cosBk;
        else l = length;

        for (let i = start; i < end; i++) {
            towerlist[i].Lk = l;
            towerlist[i].L = length;
            towerlist[i].cosa = cosBk;
            if (((end - start) == 1) && ((towerlist[i+1].Distance - towerlist[i].Distance) <= prk.PRIMARY.InsularMaxL)){
                towerlist[i].bInsular = true;
            }
            else{
                towerlist[i].bInsular = false;
                towerlist[i].constant = 0;
            }
        }
        start = end;//从终止转角继续查找下一个转角
    }
}
window.ComputeIsolate = function(t1,t2,k,constA,kMaxT,constMaxT) {
    //风压高度变化系数
    let Kh = Math.pow(prk.PRIMARY.windH/10,prk.PRIMARY.alfa);
    //判别函数值 线长系数 应力 弧垂
    let F = [],K = [],S = [],f = [];
    //档距
    let m_l = t2.Distance-t1.Distance;
    //绝缘子串参数
    let m_length,m_weights,m_weight,m_area;
    //控制应力
    let m_Tav,m_Tmax,m_Ttract;
    //分裂数
    let n = theLine.num;
    let insulateName ;
    if(t1.InsulatePA!="")
        insulateName =t1.InsulatePA;
    else if(t1.InsulatePB!="")
        insulateName =t1.InsulatePB;
    else if(t2.InsulatePA!="")
        insulateName =t2.InsulatePA;
    else if(t2.InsulatePB!="")
        insulateName =t2.InsulatePB;
    let indexIsolate = FindInsulate(insulateName);
    if(indexIsolate !=-1)
    {
        m_length = prk.INSULATE[indexIsolate].Length;
        m_weight = prk.INSULATE[indexIsolate].Weight;
        m_weights = prk.INSULATE[indexIsolate].Weight +prk.INSULATE[indexIsolate].IceWeight*prk.INSULATE[indexIsolate].Num*prk.INSULATE[indexIsolate].Join;
        m_area = prk.INSULATE[indexIsolate].area*prk.INSULATE[indexIsolate].Num*prk.INSULATE[indexIsolate].Join;
    }
    else
    {
        m_length = t1.InsulatorLength;
        m_weight = 200;
        m_weights =300;
        m_area =   1.0;
    }
    m_Tav =  theLine.Tp*theLine.k*theLine.C;
    m_Tmax = theLine.Tp*theLine.k/theLine.F;
    m_Ttract = m_Tmax;
    let bata = Math.atan((t2.hugeHigh-t1.hugeHigh)/m_l);
    let cl0 = m_length*Math.cos(bata);
    let deltaL = 0;
    let A = theLine.A;
    let E = theLine.E;
    let a = theLine.a;
    let g = 9.8;
    let G =0 ;
    let ctrl = 0;
    let ctrlK=0,Fmax=-99999;
    let l1,W1,rb,tz,r,rs,T,aa;
    for(let i=0;i<10;i++)
    {
        r = GetLoad(i,7)/A;
        if(theWeather.TWI[i].b>0)
            G = Math.sqrt((m_weights*g)*(m_weights*g),(m_area*Math.pow(theWeather.TWI[i].v*Kh,2)/1.600)*(m_area*Math.pow(theWeather.TWI[i].v*Kh,2)/1.600))/n;
        else
            G = Math.sqrt((m_weight* g)*(m_weight* g),(m_area*Math.pow(theWeather.TWI[i].v*Kh,2)/1.600)*(m_area*Math.pow(theWeather.TWI[i].v*Kh,2)/1.600))/n;
        if( i==5)		//安装工况 施工观测弧垂 一端有串
        {
            S[i] = m_Ttract/A;
            l1 = m_l- cl0;
            W1 = l1*r/Math.cos(bata);
            rb = r/Math.cos(bata);
            tz = l1*(l1+3*cl0) + 6*cl0*G/(A*W1*rb)*(W1+2.0*G/3.0/A) - 3*cl0*cl0*Math.pow(W1+G/A,2)/(m_l*W1*rb);
            K[i] = r*r*E*Math.pow(Math.cos(bata),3)/24 *tz;
            deltaL = prk.PRIMARY.pLTract;
        }
        else			// 竣工情况 两端有串
        {
            if(i==0)
                S[i] = m_Tav/A;
            else
                S[i] = m_Tmax/A;
            l1 = m_l- 2*cl0;
            W1 = l1 * r/Math.cos(bata);
            rb = r/Math.cos(bata);
            tz =  l1*(l1+6*cl0) + 12*G*cl0*(W1+2.0*G/3.0/A)/(W1*rb*A);
            K[i] = r*r*E*Math.pow(Math.cos(bata),3)/24 *tz;
            deltaL =0;
        }
        F[i] = K[i]/Math.pow(S[i],2)  -( S[i]+ a*E*Math.cos(bata)*theWeather.TWI[i].t - E*deltaL*Math.pow(Math.cos(bata),2)/l1);
        if((i==0 || i==2 || i==4 || i==5 )&&F[i]>Fmax)
        {
            ctrl = i;
            Fmax = F[i];
            ctrlK  = K[i];
        }
    }

    let f0 = -99999;
    for(let i =0;i<10;i++)
    {
        T = theWeather.TWI[i].t;
        aa = Fmax +a*E*Math.cos(bata)*T;
        S[i] =0;
        f[i] =0;
        if(theWeather.TWI[i].b>0)
            G = Math.sqrt((m_weights*g)*(m_weights*g),(m_area*Math.pow(theWeather.TWI[i].v*Kh,2)/1.600)*(m_area*Math.pow(theWeather.TWI[i].v*Kh,2)/1.600))/n;
        else
            G = Math.sqrt((m_weight* g)*(m_weight* g),(m_area*Math.pow(theWeather.TWI[i].v*Kh,2)/1.600)*(m_area*Math.pow(theWeather.TWI[i].v*Kh,2)/1.600))/n;
        rs = G/A/m_length;
        r = GetLoad(i,7)/A;
        if(i==ctrl)
        {
            if(i ==0)
                S[i] = m_Tav/A;
            else if(i ==5)
                S[i] = m_Ttract/A;
            else
                S[i] = m_Tmax/A;
        }
        else
        {
            S[i] = GetEquationValue(1.0,aa,0,-K[i],9999);
        }
        f[i] = ( r*m_l*m_l/8 + (rs-r)*cl0*cl0/2 ) / S[i]/Math.cos(bata);
        if(i!=9  && f[i]>f0)
        {
            k = r/2/S[i];
            constA = (rs-r)*cl0*cl0/2/S[i];
            f0 = f[i];
        }
        else if(i ==9)
        {
            kMaxT = r/2/S[i];
            constMaxT = (rs-r)*cl0*cl0/2/S[i];
        }
    }
}
window.ComputeK = function(l0,sita) {
    let k=0;
    let condition = -1;
    k = GetMaxK(l0, sita,condition);
    return k;
}
window.ComputeK2 = function() {
    for (let i = m_start; i < m_end; i++) {
        initializeDataBool(towerlist[i].Distance,towerlist[i].u,true,1);
        if (towerlist[i].bInsular){
            let k,constant,kMaxT,constMaxT;
            ComputeIsolate(towerlist[i],towerlist[i+1],k,constant,kMaxT,constMaxT);
            towerlist[i].kPline = k;
            towerlist[i].kWind  = k;
            towerlist[i].kMaxT  = kMaxT;
            towerlist[i].constant = constant;
            towerlist[i].constMaxT = constMaxT;
        }else {
            towerlist[i].kPline = ComputeK(towerlist[i].Lk,towerlist[i].cosa);
            towerlist[i].kWind = GetLoad(3,7)/theLine.A/GetStrain(towerlist[i].Lk,towerlist[i].cosa,3)/2.0;
            towerlist[i].kMaxT = GetLoad(9,7)/theLine.A/GetStrain(towerlist[i].Lk,towerlist[i].cosa,9)/2.0;
        }
    }
}
window.GetLoaLob = function(l0,cosa,condition,l,h,Loa,Lob) {
    let s, p,r;
    s = GetStrain(l0,  cosa,condition);
    p = theWeather.TWI[condition].P7;//r为综合比载
    r = p/theLine.A;
    Loa = l/2.0 - s/r*arcsh(r*h/(2*s*sinh(r*l/2.0/s)));
    //Lob = l/2.0 + s/r*arcsh(r*h/(2*s*sinh(r*l/2.0/s)));
    Lob = l - Loa;
}
window.GetLoaLob2 = function(k,l,h) {
    let Loa = l/2.0 - arcsh(k*h/sinh(k*l))/2.0/k;
    let Lob = l - Loa;
    let lo = new Array(Loa,Lob);
    return lo

}
window.ComputeLH = function() {
    let sita;
    let indexComputeLH = -1;
    let count = towerlist.length;
    if (count > 0){
        towerlist[0].Lh1 = 0;
        towerlist[count-1].Lh2 = 0;
        for(let i=m_start;i<m_end;i++)
        {
            //计算单侧水平档距
            sita = Math.atan((towerlist[i+1].hugeHigh-towerlist[i].hugeHigh)/(towerlist[i+1].Distance - towerlist[i].Distance));
            towerlist[i].Lh2 = (towerlist[i+1].Distance - towerlist[i].Distance)/Math.cos(sita)/2;
            towerlist[i+1].Lh1 = (towerlist[i+1].Distance - towerlist[i].Distance)/Math.cos(sita)/2;
        }
        for(let i=m_start;i<=m_end;i++)
        {
            towerlist[i].Lh = towerlist[i].Lh1 + towerlist[i].Lh2;
            indexComputeLH = FindTower(towerlist[i]);
            if(indexComputeLH>0)
            {
                if(prk.TOWER[indexComputeLH].LH<towerlist[i].Lh)
                    towerlist[i].towererror = true;
                else
                    towerlist[i].towererror = false;
            }
        }
    }

}
window.ComputeLV = function(condition) {
    let Loa,Lob;
    let Lo = [];
    let indexComputeLV= -1;
    let k=0;
    let count = towerlist.length;
    if (count > 0) {
        towerlist[0].Lv1 = 0;
        towerlist[count-1].Lv2 = 0;
        for(let i=m_start;i<m_end;i++)
        {
            //计算单侧垂直档距
            if(condition<0)
                k = towerlist[i].kPline;
            else
            {
                initializeDataBool(towerlist[i].Distance,towerlist[i].u,true,1);
                k = GetLoad(condition,7)/theLine.A/GetStrain(towerlist[i].Lk,towerlist[i].cosa,condition)/2.0;
            }
            Lo = GetLoaLob2(k, (towerlist[i+1].Distance - towerlist[i].Distance), towerlist[i+1].hugeHigh-towerlist[i].hugeHigh)
            Loa = Lo[0];
            Lob = Lo[1];
            towerlist[i].Lv2 = Loa;
            towerlist[i+1].Lv1 = Lob;
        }
        for(let i=m_start;i<=m_end;i++)
        {
            if(condition<0)
            {
                towerlist[i].Lv = towerlist[i].Lv1 + towerlist[i].Lv2;
                indexComputeLV = FindTower(towerlist[i]);
                if(indexComputeLV>0)
                {
                    if(prk.TOWER[indexComputeLV].LV<towerlist[i].Lv)
                        towerlist[i].towererror = true;
                    else
                        towerlist[i].towererror = false;
                }
            }
            else if(condition == 1)
                towerlist[i].lvMaxTemp = towerlist[i].Lv1 + towerlist[i].Lv2;
            else if(condition == 2)
                towerlist[i].lvMinTemp = towerlist[i].Lv1 + towerlist[i].Lv2;
            else if(condition == 3)
                towerlist[i].lvMaxWind = towerlist[i].Lv1 + towerlist[i].Lv2;
            else if(condition == 4)
                towerlist[i].lvMaxIce  = towerlist[i].Lv1 + towerlist[i].Lv2;
        }
    }
}
window.ComputeLhLv = function() {
    ComputeLH();
    ComputeLV(-1);
}
window.ComputeGK = function(l0,cosa) {
    let k= 0;
    let condition = -1;
    k = GetMinK(l0, cosa,condition);
    return k;
}
window.ComputeGK2 = function() {
    for(let i=m_start;i<m_end;i++)
    {
        initializeDataBool(towerlist[i].Distance,1,false,1);
        towerlist[i].kGround = ComputeGK(towerlist[i].Lk,1);
    }
}
//最低点三角
function DisplayFawLowest(x,y,x0,material) {
    material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    let trianH = 0.5 * Math.tan(50 * (Math.PI/180));
    console.log("三角形")
    console.log(trianH);
    let leftP = new THREE.Vector3(x/10+0.5-0.5,y - yMin + trianH,0);
    let rightP = new THREE.Vector3(x/10+0.5+0.5,y - yMin + trianH,0);
    let bottomP = new THREE.Vector3(x/10+0.5,y - yMin,0);
    let triangleGeo = new THREE.Geometry();
    triangleGeo.vertices.push(bottomP);
    triangleGeo.vertices.push(leftP);
    triangleGeo.vertices.push(rightP);
    triangleGeo.vertices.push(bottomP);

    let triangle =new THREE.Line(triangleGeo,material);
    scene.add(triangle);
}
//弧垂
window.DisplayFawCurve = function(x1,y1,x2,y2,k,x0,bInsular,constt,length,material, name) {

    if (x1 < 0) return;
    let f,l1,l2,l,x3, y3;
    let loa,h;
    let endL,startL;
    let ptCount =0;
    let insertPoint = [];

    l1 = 0;
    l = x2-x1;
    h = y2-y1;
    loa = l/2.0 - arcsh(k*h/sinh(k*l))/2.0/k;
    if(!bInsular)
    {
        startL=x1 + length;
        endL = Math.min(x2,xMax);
        ptCount = parseInt(endL - startL)+1;
        for(let i=0;i<ptCount &&i< 2048 ;i++ )
        {
            l1 = 1.0*i + startL-x1;
            l2 = l - l1;
            if(i!=ptCount-1)//非最后点
            {
                //P180手册公式
                f = l1*h/l +( sinh(k*(2*loa-l1)) * sinh(k*l1) )/k;
                x3 = x1 + l1;
                y3 = (l1*y2+l2*y1)/l-f;
                // y3 = y1-sinh(k*l2-arcsh(k*(y2-y1))/sinh(k*l)) * sinh(k*l1) /k;
            }
            else if(x2 <= xmax)	//最后一点
            {
                x3 = x2;
                y3 = y2;
            }
            insertPoint.push(new THREE.Vector3(x3/10 + 0.5, y3 - yMin, 0))
        }
    }
    else
    {
        startL=x1;
        endL = Math.min( x2-length*Math.cos(Math.atan(h/l)),xMax );
        ptCount = parseInt (endL - startL)+2;
        for(let i=0;i<ptCount;i++ )
        {
            if(i==0)			//第一点
            {
                x3 = x1;
                y3 = y1;
            }
            else if(i!=ptCount-1)//中间点
            {
                l1 = 1.0*(i-1) + startL-x1;
                l2 = l - l1;
                //P193手册公式
                f =( k*l1*(l-l1) + constt )/Math.cos(Math.atan(h/l));
                x3 = x1 + l1;
                y3 = (l1*y2+l2*y1)/l-f;
            }
            else if(x2<=xMax)	//最后一点
            {
                x3 = x2;
                y3 = y2;
            }
            insertPoint.push(new THREE.Vector3(x3/10, y3 - yMin, 0))
        }
    }
    // var conductMaterial = new THREE.LineBasicMaterial( { color: 0xff00ff } );
    var conductGeo = new THREE.Geometry();
    for (let i = 0 ; i <insertPoint.length ; i++){
        conductGeo.vertices.push(insertPoint[i]);
    }
    var conductObj = new THREE.Line( conductGeo, material );
    conductObj.name = name;
    scene.add(conductObj);
}
window.DisplayFawCurve2 = function(x1,y1,x2,y2,k,dspLwst,bInsular,constt,length,material, name) {
    if( x2-x1<10 || x2-x1>3000 || Math.abs(y1-y2)>2000 ) {
        return;
    }
    let f,l1,l2,l;
    let loa,h,xx,yy;
    // let insertPoint = [];
    let lx1 = x1,lx2 = x2;
    l1 = 0;
    l = x2-x1;
    h = y2-y1;
    xx = (x1+x2)/2;
    if(k==0) k = 300*1E-6;
    //计算弧垂最低点坐标
    loa = l/2.0 - arcsh(k*h/sinh(k*l))/2.0/k;
    f = loa*h/l +( sinh(k*(2*loa-loa)) * sinh(k*loa) )/k;
    l = x2 - x1;
    l1 = loa;
    l2 = l-loa;
    xx = x1 + loa;
    yy = (l1*y2+l2*y1)/l-f;

    // if (dspLwst)
    // DisplayFawLowest(xx,  yy-constt, lx1, material);
    DisplayFawCurve( x1, y1, x2, y2, k, lx1, bInsular, constt,length,material, name);

    //显示超出范围的弧垂
    if((xx<x1 || xx>x2) && dspLwst)
    {
        if(xx<x1)
        {
            x2 = x1;
            y2 = y1;
            x1 = xx;
            y1 = yy;
        }
        else
        {
            x1 = x2;
            y1 = y2;
            x2 = yy;
            y2 = yy;
        }
        DisplayFawCurve(x1, y1, x2, y2, k, lx1, bInsular, constt,length, name);
    }
}
window.DisplayFawCurve3 = function(tower1, tower2, kPower, kGround, name){
    let constt=0;
    if(tower1.displayKType==0)
        constt = tower1.constant;
    else if(tower1.displayKType==1)
        constt = tower1.constMaxT;
    if(tower1.displayGround){
        let wire_material = new THREE.LineBasicMaterial({color: 0x000000});
        DisplayFawCurve2(tower1.Distance,tower1.hugeGround,tower2.Distance,tower2.hugeGround,kGround,false,false,0,0,wire_material, name+"1");
    }
    if(tower1.displayPower){
        let wire_material1 = new THREE.LineBasicMaterial({color: 0x000000});
        DisplayFawCurve2(tower1.Distance,tower1.hugeHigh, tower2.Distance,tower2.hugeHigh,kPower,true,
            tower1.bInsular,constt,tower1.InsulatorLength,wire_material1, name+"2");
    }
    if(tower1.displaySafe){
        let wire_material2 = new THREE.LineBasicMaterial({color: 0x0000ff});
        DisplayFawCurve2(tower1.Distance,tower1.hugeHigh-tower1.LandDist, tower2.Distance,tower2.hugeHigh-tower1.LandDist,
            kPower,false,tower1.bInsular,constt,tower1.InsulatorLength,wire_material2, name+"3");
    }
    if(tower1.displayCross){
        let wire_material3 = new THREE.LineBasicMaterial({color: 0xff0000});
        DisplayFawCurve2(tower1.Distance,tower1.hugeHigh-tower1.ElecDist, tower2.Distance,tower2.hugeHigh-tower1.ElecDist,
            kPower,false,tower1.bInsular,constt,tower1.InsulatorLength,wire_material3, name+"4");
    }
}
window.DisplayFawCurve4 = function(tower1,tower2, name){
    if(tower1.displayKType==0){
        DisplayFawCurve3(tower1, tower2, tower1.kPline, tower1.kGround, name);
    }
    // else if(tower1.displayKType==1)
    // 	DisplayFawCurve3(tower1, tower2, tower1.kMaxT,  tower1.kGround);
}

// m_start = 0;
// m_end = towerlist.length - 1;
// ComputeHugeHigh();
