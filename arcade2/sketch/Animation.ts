enum AnimationType {
    LOOPABLE,
    SINGULAR
}

class CharacterAnimation {
    spritesheet: p5.Image;
    frames: any;
    length: number;

    speed: number;
    frameCount: number;
    type: AnimationType;
    hPadding: number = 0;

    callback: any = null;

    constructor(animationInfoJson: any, animationSpritesheetImage: p5.Image) {

        this.initAnimation(animationInfoJson, animationSpritesheetImage);
    }

    initAnimation(animationInfoJson: any, animationSpritesheetImage: p5.Image) {
        this.spritesheet = animationSpritesheetImage;
        this.frames = animationInfoJson.frames;
        this.length = animationInfoJson.frames.length;

        this.frameCount = 0;
        this.speed = 4;

        this.type = AnimationType.LOOPABLE;
    }

    draw(x: number, y: number, w: number, h: number, isFlipped: boolean) {
        let source = this.frames[this.frameCount].frame;

        push();
        if (isFlipped) {
            scale(-1, 1);
            translate(-w, 0);
        }

        x *= isFlipped ? -1 : 1;
        image(this.spritesheet, x + this.hPadding, y, w - this.hPadding, h, source.x, source.y, source.w, source.h);

        pop();
    }

    nextFrame() {
        if (this.type == AnimationType.LOOPABLE) {
            this.frameCount += 1;
            this.frameCount %= this.length;
        } else if (this.type == AnimationType.SINGULAR) {

            if (this.frameCount < this.length - 1) {
                this.frameCount += 1;
            } else if (this.callback != null) {
                this.callback(this);
            }

        }
    }
}


class AnimationManager {
    animations: { [key: string]: CharacterAnimation };
    isFlipped: boolean;
    currentAnimation: string;

    constructor() {
        this.animations = {};
        this.isFlipped = false;
    }

    addAnimation(name: string, spritesheetInfo: any, spritesheetImage: p5.Image) {
        this.animations[name] = new CharacterAnimation(spritesheetInfo, spritesheetImage);
    }

    draw(name: string, x: number, y: number, w: number, h: number) {
        let animation = this.animations[name];
        animation.draw(x, y, w, h, this.isFlipped);

        if (frameCount % animation.speed == 0) {
            animation.nextFrame();
        }
    }

    playCurrentAnimation(x: number, y: number, w: number, h: number) {
        this.draw(this.currentAnimation, x, y, w, h);
    }

    setSpeed(name: string, speed: number) {
        this.animations[name].speed = ceil(speed);
    }

    setAnimationType(name: string, type: AnimationType) {
        this.animations[name].type = type;
    }

    resetAnimation(name: string) {
        this.animations[name].frameCount = 0;
    }

    setHPadding(name: string, hPadding: number) {
        this.animations[name].hPadding = hPadding;
    }

    setCurrentAnimation(name: string) {
        this.currentAnimation = name;
    }



    save() {
        return {
            animations: { ...this.animations },
            isFlipped: this.isFlipped,
            currentAnimation: this.currentAnimation
        }
    }

    load(saveState: any) {
        this.animations = { ...saveState.animations };
        this.isFlipped = saveState.isFlipped;
        this.currentAnimation = saveState.currentAnimation;
    }
}