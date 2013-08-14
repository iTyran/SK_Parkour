require("Coin.js");
require("Rock.js");

var ObjectManager = cc.Class.extend({
    spriteSheet:null,
    space:null,
    objects:[],

    ctor:function (spriteSheet, space) {
        this.spriteSheet = spriteSheet;
        this.space = space;
        // objects will keep when new ObjectManager();
        // we need clean here
        this.objects = [];
    },

    initObjectOfMap:function (map, mapWidth) {
        //random the center point of 7 coins.
        var randomCoinFactor = Math.round(Math.random()*2+1);
        var randomRockFactor = Math.round(Math.random()*2+1);
        var jumpRockFactor = 0;

        var coinPoint_x = mapWidth/4 * randomCoinFactor+mapWidth*map;
        var RockPoint_x = mapWidth/4 * randomRockFactor+mapWidth*map;

        var coinWidth = Coin.getContentSize().width;
        var rockWith = Rock.getContentSize().width;
        var rockHeight =  Rock.getContentSize().height;

        var startx = coinPoint_x - coinWidth/2*11;
        var xIncrement = coinWidth/2*3;
        log("xIncrement: "+xIncrement+" startx:"+startx+" spriteWidth:"+coinWidth);
        log("rockHeight:"+rockHeight);
        log("map: "+map);

        //add a rock
        var rock = new Rock(this.spriteSheet, this.space,
                cc.p(RockPoint_x, g_groundHight+rockHeight/2));
        rock.map = map;
        this.objects.push(rock);
        if(map == 0 && randomCoinFactor==1){
            randomCoinFactor = 2;
        }
        log("randomRockFactor : "+randomRockFactor+" randomCoinFactor:"+randomCoinFactor );

        //add 7 coins
        for(i = 0; i < g_initCoinNum; i++)
        {
            if((startx + i*xIncrement > RockPoint_x-rockWith/2) //岩石底部高度和陷阱顶部高度
                &&(startx + i*xIncrement < RockPoint_x+rockWith/2))
            {
                var coin1 = new Coin(this.spriteSheet, this.space,
                        cc.p(startx + i*xIncrement, g_coinHeight+rockHeight));
            } else{
                var coin1 = new Coin(this.spriteSheet, this.space,
                        cc.p(startx + i*xIncrement, g_coinHeight));
            }

            coin1.map = map;
            this.objects.push(coin1);
        }

        for(i=1;i<4;i++){
            if(i!=randomCoinFactor&&i!=randomRockFactor){
                jumpRockFactor = i;
            }
        }

        //add jump rock
        var JumpRockPoint_x = mapWidth/4 * jumpRockFactor+mapWidth*map;
        var jumpRock = new Rock(this.spriteSheet, this.space,
                cc.p(JumpRockPoint_x, g_jumpRockHeight+rockHeight/2));
        jumpRock.map = map;
        this.objects.push(jumpRock);
    },

    recycleObjectOfMap:function (map) {
        while((function (obj, map) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i].map == map) {
                    obj[i].removeFromParent();
                    obj.splice(i, 1);
                    return true;
                }
            }
            return false;
        })(this.objects, map));
    },

    remove:function (obj) {
        obj.removeFromParent();
        // find and delete obj
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i] == obj) {
                this.objects.splice(i, 1);
                break;
            }
        }
    },
});

