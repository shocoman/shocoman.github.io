class ObjectAnimation {
    img: p5.Image;
    colsNumber: number;
    rowsNumber: number;
    numberOfFrames: number;
    currentFrame: number;
    framePos: p5.Vector;
    frameSize: p5.Vector;
    columnOffset: number;
    rowOffset: number;
    isPaused: boolean;


    constructor(sprite_sheet_path: string, cols_num: number, rows_num: number, frames_num: number, frame_pos: p5.Vector, frame_size: p5.Vector, col_offset = 0, row_offset = 0) {
        this.img = loadImage(sprite_sheet_path);

        this.colsNumber = cols_num;
        this.rowsNumber = rows_num;
        this.numberOfFrames = frames_num;

        this.currentFrame = 0;

        this.framePos = frame_pos;
        this.frameSize = frame_size;
        this.columnOffset = col_offset;
        this.rowOffset = row_offset;
    }

    draw(pos: p5.Vector, size: p5.Vector, is_flipped: boolean) {
        push();
        if (is_flipped) {
            scale(-1, 1);
            translate(-size.x, 0);
        }

        image(this.img, pos.x * (is_flipped ? -1 : 1), pos.y, size.x, size.y,
            this.framePos.x + this.get_current_col() * (this.frameSize.x + this.columnOffset),
            this.framePos.y + this.get_current_row() * (this.frameSize.y + this.rowOffset),
            this.frameSize.x, this.frameSize.y);
        pop();
    }

    next_frame() {
        this.currentFrame += 1;
        if (this.currentFrame >= this.numberOfFrames) {
            this.currentFrame = 0;
        }
    }

    play() {
        this.isPaused = !this.isPaused;
    }

    get_current_col() {
        return this.currentFrame % this.colsNumber;
    }

    get_current_row() {
        return int(this.currentFrame / this.colsNumber);
    }

}


class AnimationManager {
    anims: Record<string, ObjectAnimation>;
    paused: boolean;
    is_flipped: boolean;
    speed: number;

    constructor() {
        this.anims = {};
        this.paused = false;
        this.is_flipped = false;
        this.speed = 5;
    }

    load(name: string, sprite_sheet_path: string, cols_num: number, rows_num: number, frames_num: number, frame_pos: p5.Vector, frame_size: p5.Vector) {
        let new_animation = new ObjectAnimation(sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size);
        this.anims[name] = new_animation;
    }

    show(name: string, pos: p5.Vector, size: p5.Vector, frame: number | undefined = undefined) {
        if (frame != undefined) this.anims[name].currentFrame = frame;
        this.anims[name].draw(pos, size, this.is_flipped);

        if (!this.paused && frameCount % this.speed == 0)
            this.anims[name].next_frame();
    }

    play() {
        this.paused = !this.paused;
    }

    flip() {
        this.is_flipped = !this.is_flipped;
    }

    set_speed(speed: number) {
        this.speed = speed;
    }
}