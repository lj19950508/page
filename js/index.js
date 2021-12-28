//获取节点
function query(option) {
    var ele = document.querySelectorAll(option);
    if (ele.length == 1) {
        return ele[0];
    } else {
        return ele;
    }
}

//绑定事件的方法()
function addEvent(element, type, fn, isCapture) {
    //w3c标准浏览器或ie8以上浏览器 绑定事件
    if (window.addEventListener) {
        isCapture = isCapture ? true : false;
        element.addEventListener(type, fn, isCapture);
    } //ie8或以下版本浏览器绑定事件
    else {
        //ie8或以下版本浏览器只有冒泡触发
        element.addachEvent('on' + type, fn);
    }
}

//获取节点
var begin = query(".begin"); //开始游戏
var plane = query(".plane"); //获取开始游戏界面的元素
var game = query("#game"); //获取游戏进行界面
var bg = query(".bg"); //获取背景元素
var myplane = query(".myplane"); //获取我方飞机
//获取游戏主界面的元素 计算之后的样式
var planeStyle = getComputedStyle(plane);
//获取游戏主界面宽度
var planeWidth = parseInt(planeStyle.width);
//获取游戏主界面高度
var planeHeight = parseInt(planeStyle.height);

//获取我方飞机计算之后的样式
var myplaneStyle = getComputedStyle(myplane);
//获取我方飞机的宽度
var myplaneWidth = parseInt(myplaneStyle.width);
//获取我方飞机高度
var myplaneHeight = parseInt(myplaneStyle.height);


//飞机所能达到的最大left值
var MAX_left = planeWidth - myplaneWidth;
//飞机所能达到的最大top值
var MAX_top = planeHeight - myplaneHeight;

//定时器
var movebgTimer = null; //移动背景的定时器
var bulletTimer = null; //子弹的定时器
var moveBulletTimer = null; //移动子弹定时器
var enemyPlaneTimer = null; //敌机的定时器
var moveEnemyPlaneTimer = null; //移动敌机的定时器

//给开始游戏按钮绑定事件
addEvent(begin, "click", moveGameBg);


//移动背景
function moveGameBg() {
    game.style.display = "block"; //显示游戏界面
    movebgTimer = setInterval(function() {

            for (var i = 0; i < bg.length; i++) {
                var currentTop = parseInt(getComputedStyle(bg[i]).top); //每一个背景计算过后的当前的top

                currentTop += 2; //每次移动背景2px
                currentTop = currentTop >= planeHeight ? -planeHeight : currentTop; //超过页面高度，回-1屏
                bg[i].style.top = currentTop + 'px'; //移动背景
            }

        }, 50) //用定时器 让背景移动
    createEveryBullet(); //创建子弹实例的方法
    moveEveryBullet(); //子弹移动
    createEveryEnemyPlane(); //创建敌方飞机
    moveEveryEnemyPlane(); //敌方飞机移动
}

//给我方飞机绑定事件 给整个游戏进行界面绑定
addEvent(game, "mousemove", myPlane)

//移动我方飞机
function myPlane(e) {
    //获取游戏页面元素在页面中的坐标
    var gameoffsetLeft = plane.offsetLeft;
    var gameoffsetTop = plane.offsetTop;

    //鼠标在游戏进行界面中的坐标 =  鼠标在整个屏幕中的坐标 - 游戏进行界面的元素距离页面左上角的坐标
    var left = e.pageX - gameoffsetLeft;
    var top = e.pageY - gameoffsetTop;
    //我方飞机left值=鼠标坐标-飞机宽度的一半
    left = left - myplaneWidth / 2;
    //我方飞机TOP值=鼠标坐标-飞机高度的一半
    top = top - myplaneHeight / 2;
    //边界控制
    left = left < 0 ? 0 : left > MAX_left ? MAX_left : left;
    top = top < 0 ? 0 : top > MAX_top ? MAX_top : top;
    //让飞机跟随鼠标移动
    myplane.style.left = left + "px";
    myplane.style.top = top + "px";
}

//构建 子弹类
//子弹构造函数

function Bullet() {
    //每一个子弹的尺寸
    this.bulletwidth = 6;
    this.bulletheight = 14;
    //每一颗子弹 出现在页面中的位置
    this.bulletX = 0;
    this.bulletY = 0;
    // 每一颗子弹的 页面节点和路径
    this.bulletSrc = "./images/cartridge.png";
    this.currentBullet = null;
}

//创建子弹元素节点的原型方法
Bullet.prototype.createBullet = function() {
    //创建子弹标签
    this.currentBullet = document.createElement("img");
    //给图片标签添加src属性
    this.currentBullet.src = this.bulletSrc;
    //给创建的节点添加宽高
    this.currentBullet.style.width = this.bulletwidth;
    this.currentBullet.style.height = this.bulletheight;
    //每次创建节点前都要获取我方飞机坐标
    var myplaneX = parseInt(myplaneStyle.left);
    var myplaneY = parseInt(myplaneStyle.top);

    //生成子弹坐标：让子弹的位置出现在我方飞机的头部
    this.bulletX = myplaneX + myplaneWidth / 2 - this.bulletwidth / 2;
    this.bulletY = myplaneY - this.bulletheight - 10;

    //设置子弹坐标的样式
    this.currentBullet.style.left = this.bulletX + "px";
    this.currentBullet.style.top = this.bulletY + "px";



    //把每一个创建的子弹节点插入到页面中
    game.appendChild(this.currentBullet);


}

//移动子弹的原型方法
Bullet.prototype.moveBullet = function(index) {
        //每次让子弹移动2px
        this.bulletY -= 2;
        //子弹超出屏幕之外，移除页面子弹
        if (this.bulletY <= 0) {
            this.currentBullet.remove(); //移除子弹
            //在数组中移除超出屏幕的子弹对象
            bullets.splice(index, 1);
        } else {
            //设置子弹移动
            this.currentBullet.style.top = this.bulletY + "px";
        }
    }
    //子弹击中敌方飞机
Bullet.prototype.shootEnemyPlane = function(index) {
    //获取所有敌方飞机
    for (var i = 0; i < enemyPlanes.length; i++) {
        //当前子弹碰撞检测
        if (this.bulletX >= enemyPlanes[i].enemyPlaneX - this.bulletwidth &&
            this.bulletX <= enemyPlanes[i].enemyPlaneX + enemyPlanes[i].enemyPlaneWidth &&
            this.bulletY >= enemyPlanes[i].enemyPlaneY - this.bulletheight &&
            this.bulletY <= enemyPlanes[i].enemyPlaneY + enemyPlanes[i].enemyPlaneHeight) {
            //减少敌方飞机血量
            enemyPlanes[i].enemyPlaneBlood -= 1;
            if (enemyPlanes[i].enemyPlaneBlood <= 0) {
                //在当前飞机位置创建一个敌机爆炸图片
                var boomEnemyPlane = document.createElement("img");
                //爆炸的图片
                boomEnemyPlane.src = enemyPlanes[i].enemyPlaneDieSrc;
                //宽高等于炸毁飞机的宽高
                boomEnemyPlane.style.width = enemyPlanes[i].enemyPlaneWidth + "px";
                boomEnemyPlane.style.height = enemyPlanes[i].enemyPlaneHeight + "px";
                //出现在炸毁飞机的位置
                boomEnemyPlane.style.position = "absolute";
                boomEnemyPlane.style.left = enemyPlanes[i].enemyPlaneX + "px";
                boomEnemyPlane.style.top = enemyPlanes[i].enemyPlaneY + "px";
                boomEnemyPlane.style.zIndex = 9;
                //移除炸毁的飞机节点
                enemyPlanes[i].currentEnemyPlane.remove();
                enemyPlanes.splice(i, 1); //从数组中删除
                game.appendChild(boomEnemyPlane); //插入节点

                setTimeout(function() {
                    boomEnemyPlane.remove(); //销毁敌机爆炸图
                }, 500)
            }
            //击中敌机的子弹立刻销毁
            this.currentBullet.remove();
            bullets.splice(index, 1); //从数组中移除子弹
        }
    }
}

//保存子弹实例对象的数组
var bullets = [];

//创建每一颗子弹的方法
function createEveryBullet() {
    bulletTimer = setInterval(function() {
        var bullet = new Bullet(); //每300ms创建一个子弹对象
        //每个实例对象都要调用创建子弹节点的原型方法
        bullet.createBullet();
        //把创建出来的子弹存入数组中
        bullets.push(bullet);
        // console.log(bullets);
    }, 100)
}

function moveEveryBullet() {
    //每隔4ms移动所有子弹一次
    moveBulletTimer = setInterval(function() {
        //获取所有创建出来的子弹对象
        for (var i = 0; i < bullets.length; i++) {
            //让数组里面的每一颗子弹都移动
            bullets[i].moveBullet(i);
            //如果当前子弹被移除 断开函数执行
            if (bullets[i] == undefined) {
                return;
            }
            //每次移动子弹都要检测碰撞
            bullets[i].shootEnemyPlane(i);
        }
    }, 4)
}



//敌方飞机
var enemy = [
    //小飞机
    { img: './images/plain1.png', dieImg: './images/plain1_die.gif', blood: 1, width: 34, height: 24 },
    //中飞机
    { img: './images/plain2.png', dieImg: './images/plain2_die.gif', blood: 5, width: 46, height: 60 },
    //大飞机
    { img: './images/plain3.gif', dieImg: './images/plain3_die.gif', blood: 10, width: 110, height: 164 },
]

//敌方飞机的构造函数
function EnemyPlane() {
    //敌方飞机数据
    var emy = null;

    //通过随机数决定敌方飞机数据
    //0-0.5 小飞机
    //0.5-0.9 中飞机
    //0.9-1 大飞机

    var random = Math.random(); //随机数
    if (random < 0.5) {
        //小飞机
        emy = enemy[0];
    } else if (random < 0.9) {
        //中飞机
        emy = enemy[1];
    } else {
        //大飞机
        emy = enemy[2];
    }

    //敌方飞机宽高
    this.enemyPlaneWidth = emy.width;
    this.enemyPlaneHeight = emy.height;

    //敌方飞机出现的坐标  敌方飞机出现的坐标 =>  敌机所能出现的最大left值 = 屏幕宽度 - 敌机自身宽度
    this.enemyPlaneX = Math.random() * (planeWidth - this.enemyPlaneWidth); //水平坐标随机出现敌方飞机
    this.enemyPlaneY = 0 - this.enemyPlaneHeight;
    //敌方飞机图片路径
    this.enemyPlaneSrc = emy.img;
    //敌方飞机死亡图片路径
    this.enemyPlaneDieSrc = emy.dieImg;
    //敌方飞机血量
    this.enemyPlaneBlood = emy.blood;
    //敌机在页面上的元素
    this.currentEnemyPlane = null;
}

//创建敌机页面元素的原型方法
EnemyPlane.prototype.createEnemyPlane = function() {
    // 创建敌方飞机节点
    this.currentEnemyPlane = document.createElement("img");
    //给敌方飞机添加图片路径
    this.currentEnemyPlane.src = this.enemyPlaneSrc;
    //设置敌方飞机宽高
    this.currentEnemyPlane.style.width = this.enemyPlaneWidth + "px";
    this.currentEnemyPlane.style.height = this.enemyPlaneHeight + "px";
    //敌机出现的坐标
    this.currentEnemyPlane.style.position = "absolute";
    this.currentEnemyPlane.style.left = this.enemyPlaneX + "px";
    this.currentEnemyPlane.style.top = this.enemyPlaneY + "px";
    this.currentEnemyPlane.style.zIndex = "999";
    //创建敌机插入页面
    game.appendChild(this.currentEnemyPlane);
}

//移动敌机的原型方法

EnemyPlane.prototype.moveEnemyPlane = function() {
    this.enemyPlaneY += 2; //敌机移动2px
    //敌方飞机飞出屏幕，移除敌方飞机
    if (this.enemyPlaneY >= planeHeight) {
        this.currentEnemyPlane.remove(); //移除页面的敌方飞机
        enemyPlanes.shift(); //数组中移除敌方飞机
    } else {
        //设置敌机移动
        this.currentEnemyPlane.style.top = this.enemyPlaneY + "px";
    }

}


//存储敌机
var enemyPlanes = [];

//创建每一架敌方飞机
function createEveryEnemyPlane() {
    // 每隔1.5s创建一架敌方飞机
    enemyPlaneTimer = setInterval(function() {
        var enemyPlane = new EnemyPlane();
        enemyPlane.createEnemyPlane(); //创建敌机
        enemyPlanes.push(enemyPlane); //敌机加入数组
        console.log(enemyPlanes);
    }, 800)

}

//移动每一架敌机
function moveEveryEnemyPlane() {
    moveEnemyPlaneTimer = setInterval(function() {
        for (var i = 0; i < enemyPlanes.length; i++) {
            enemyPlanes[i].moveEnemyPlane();

            //每次碰撞检测前都要获取我方飞机坐标
            var myplaneX = parseInt(myplaneStyle.left);
            var myplaneY = parseInt(myplaneStyle.top);

            //判断每一架敌方飞机是否碰撞到我方飞机
            if (enemyPlanes[i].enemyPlaneX >= myplaneX - enemyPlanes[i].enemyPlaneWidth &&
                enemyPlanes[i].enemyPlaneX <= myplaneX + myplaneWidth &&
                enemyPlanes[i].enemyPlaneY >= myplaneY - enemyPlanes[i].enemyPlaneHeight &&
                enemyPlanes[i].enemyPlaneY <= myplaneY + myplaneHeight) {
                //敌机碰撞我方飞机
                // console.log("敌机碰撞我方飞机");
                //我方飞机爆炸图
                myplane.style.backgroundImage = "url(./images/me_die.gif)";

                //清除所有定时器
                clearInterval(movebgTimer);
                clearInterval(bulletTimer);
                clearInterval(moveBulletTimer);
                clearInterval(enemyPlaneTimer);
                clearInterval(moveEnemyPlaneTimer);

                movebgTimer = null; //清空移动背景的定时器
                bulletTimer = null; //清空子弹的定时器
                moveBulletTimer = null; //清空移动子弹定时器
                enemyPlaneTimer = null; //清空敌机的定时器
                moveEnemyPlaneTimer = null; //清空移动敌机的定时器
                //移除鼠标移动事件
                game.removeEventListener("mousemove", myPlane);

                //飞机被销毁，间隔2s刷新页面
                setTimeout(function() {
                    history.go(0);
                }, 2000)

            }
        }
    }, 10)
}