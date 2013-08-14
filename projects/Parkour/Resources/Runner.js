// define enum for runner status
if(typeof RunnerStat == "undefined") {
    var RunnerStat = {};
    RunnerStat.normal = 0;
    RunnerStat.jumpUp = 1;
    RunnerStat.jumpDown = 2;
    RunnerStat.crouch = 3;
    RunnerStat.incredible = 4;
};

// runner class
var Runner = cc.Node.extend({
    sprite:null,
    normalSize:null,
    crouchSize:null,
    space:null,
    body:null,// current chipmunk body
    shape:null,// current chipmunk shape
    stat:RunnerStat.normal,// init with normal status
    normalAction:null,
    jumpUpAction:null,
    jumpDownAction:null,
    crouchAction:null,
    spriteSheet:null,
    get offsetPx() {return 100;},

    ctor:function (spriteSheet, space) {
        this._super();

        this.spriteSheet = spriteSheet;
        this.space = space;
        this.init();
    },

    init:function () {
        this._super();

        this.sprite = cc.PhysicsSprite.createWithSpriteFrameName("runner0.png");
        this.normalSize = this.sprite.getContentSize();

        var tmpSprite = cc.PhysicsSprite.createWithSpriteFrameName("runnerCrouch0.png");
        this.crouchSize = tmpSprite.getContentSize();

        this.initAction();
        this.initBody();
        this.initShape("normal");

        this.sprite.setBody(this.body);
        this.sprite.runAction(this.normalAction);
        this.spriteSheet.addChild(this.sprite, 1);
        this.stat = RunnerStat.normal;
    },

    onExit:function() {
        this.normalAction.release();
        this.jumpUpAction.release();
        this.jumpDownAction.release();
        this.crouchAction.release();
        
        this._super();
    },

    initAction:function () {
        // init normalAction
        var animFrames = [];
        // num equal to spriteSheet
        for (var i = 0; i < 8; i++) {
            var str = "runner" + i + ".png";
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.create(animFrames, 0.1);
        this.normalAction = cc.RepeatForever.create(cc.Animate.create(animation));
        this.normalAction.retain();
        
        // init jumpUpAction
        animFrames = [];
        for (var i = 0; i < 4; i++) {
            var str = "runnerJumpUp" + i + ".png";
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
            animFrames.push(frame);
        }

        animation = cc.Animation.create(animFrames, 0.2);
        this.jumpUpAction = cc.Animate.create(animation);
        this.jumpUpAction.retain();

        // init jumpDownAction
        animFrames = [];
        for (var i = 0; i < 2; i++) {
            var str = "runnerJumpDown" + i + ".png";
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
            animFrames.push(frame);
        }

        animation = cc.Animation.create(animFrames, 0.3);
        this.jumpDownAction = cc.Animate.create(animation);
        this.jumpDownAction.retain();

        // init crouchAction
        animFrames = [];
        for (var i = 0; i < 1; i++) {
            var str = "runnerCrouch" + i + ".png";
            var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(str);
            animFrames.push(frame);
        }

        animation = cc.Animation.create(animFrames, 0.3);
        this.crouchAction = cc.Animate.create(animation);
        this.crouchAction.retain();
    },

    initBody:function () {
        // create chipmunk body
        this.body = new cp.Body(1, cp.momentForBox(1,
                    this.normalSize.width, this.normalSize.height));
        this.body.p = cc.p(this.offsetPx, g_groundHight + this.normalSize.height / 2);
        this.body.v = cp.v(150, 0);//run speed
        this.space.addBody(this.body);
    },

    levelUp:function () {
        // run faster
        this.body.applyImpulse(cp.v(10, 0), cp.v(0, 0));
    },

    initShape:function (type) {
        if (this.shape) {
            this.space.removeShape(this.shape);
        }
        if (type == "normal") {
            this.shape = new cp.BoxShape(this.body,
                    this.normalSize.width, this.normalSize.height);
        } else {
            // crouch
            this.shape = new cp.BoxShape(this.body,
                    this.crouchSize.width, this.crouchSize.height);
        }
        this.shape.setCollisionType(SpriteTag.runner);
        this.space.addShape(this.shape);
    },

    getPositionX:function () {
        return this.sprite.getPositionX();
    },

    normalHulk:function () {
        // slow down
        this.body.applyImpulse(cp.v(-200, 0), cp.v(0, 0));
        this.stat = RunnerStat.normal;
        this.sprite.stopAllActions();
        this.sprite.runAction(this.normalAction);
        // clean screen, to avoid rock
        this.getParent().cleanScreen();
    },

    incredibleHulk:function () {
        this.stat = RunnerStat.incredible;
        // run faster
        this.body.applyImpulse(cp.v(200, 0), cp.v(0, 0));
        this.scheduleOnce(this.normalHulk, 3.0);
    },

    // return:
    //      true for die
    //      flase for alive
    meetRock:function () {
        if (this.stat == RunnerStat.incredible) {
            return false;
        } else {
            this.sprite.stopAllActions();
            //TODO: player die animation
            return true;
        }
    },

    jump:function () {
        if (this.stat == RunnerStat.normal) {
            this.body.applyImpulse(cp.v(0, 250), cp.v(0, 0));
            this.stat = RunnerStat.jumpUp;
            this.sprite.stopAllActions();
            this.sprite.runAction(this.jumpUpAction);
        }
    },
    
    crouch:function () {
        if (this.stat == RunnerStat.normal) {
            this.initShape("crouch");
            this.sprite.stopAllActions();
            this.sprite.runAction(this.crouchAction);
            this.stat = RunnerStat.crouch;
            // after time turn to normal stat
            this.scheduleOnce(this.loadNormal, 1.0);
        }
    },

    loadNormal:function (dt) {
        this.initShape("normal");
        this.sprite.stopAllActions();
        this.sprite.runAction(this.normalAction);
        this.stat = RunnerStat.normal;
    },

    step:function (dt) {
        var vel = this.body.getVel();
        if (this.stat == RunnerStat.jumpUp) {
            if (vel.y < 0.1) {
                this.stat = RunnerStat.jumpDown;
                this.sprite.stopAllActions();
                this.sprite.runAction(this.jumpDownAction);
            }
            return;
        }
        if (this.stat == RunnerStat.jumpDown) {
            if (vel.y == 0) {
                this.stat = RunnerStat.normal;
                this.sprite.stopAllActions();
                this.sprite.runAction(this.normalAction);
            }
            return;
        }
    },
});

