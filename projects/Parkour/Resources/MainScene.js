require("jsb.js");
require("Utils.js");
require("PlayScene.js");

var MainLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();
        var centerPos = cc.p(winSize.width / 2, winSize.height / 2);

        var spriteBG = cc.Sprite.create("MainBG.png");
        spriteBG.setPosition(centerPos);
        this.addChild(spriteBG);

        cc.MenuItemFont.setFontSize(60);
        var menuItemPlay = cc.MenuItemFont.create("Play", this.onPlay, this);
        var menu = cc.Menu.create(menuItemPlay);
        menu.setPosition(centerPos);
        this.addChild(menu);
    },

    // on play button clicked
    onPlay:function (sender) {
        cc.Director.getInstance().replaceScene(PlayLayer.scene());
    }
});

MainLayer.scene = function () {
    var scene = cc.Scene.create();
    var layer = new MainLayer();
    scene.addChild(layer);
    return scene;
};

// main entry
try {
    director = cc.Director.getInstance();
    winSize = director.getWinSize();
    // run first scene
    director.runWithScene(MainLayer.scene());

} catch(e) {log(e);}
