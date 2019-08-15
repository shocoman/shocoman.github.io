class Animation {

    constructor(sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size, col_offset = 0, row_offset = 0) {
        this.img = loadImage(sprite_sheet_path);

        this.cols_number = cols_num;
        this.rows_number = rows_num;
        this.number_of_frames = frames_num;

        this.current_frame = 0;

        this.frame_pos = frame_pos;
        this.frame_size = frame_size;
        this.column_offset = col_offset;
        this.row_offset = row_offset;
    }

    draw(pos, size, is_flipped) {

        push();
        if (is_flipped) {
            scale(-1, 1);
            translate(-size.x, 0);
        }

        image(this.img, pos.x * (is_flipped ? -1 : 1), pos.y, size.x, size.y,
            this.frame_pos.x + this.get_current_col() * (this.frame_size.x + this.column_offset),
            this.frame_pos.y + this.get_current_row() * (this.frame_size.y + this.row_offset),
            this.frame_size.x, this.frame_size.y);


    }

    next_frame() {
        this.current_frame += 1;
        if (this.current_frame >= this.number_of_frames) {
            this.current_frame = 0;
        }
    }

    play() {
        this.is_paused = !this.is_paused;
    }

    get_current_col() {
        return this.current_frame % this.cols_number;
    }

    get_current_row() {
        return int(this.current_frame / this.cols_number);
    }

}


class AnimationManager {

    constructor() {
        this.anims = [];
        this.paused = false;
        this.is_flipped = false;
        this.speed = 5;
    }

    load(name, sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size) {
        let new_animation = new Animation(sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size);
        this.anims[name] = new_animation;
    }

    show(name, pos, size, frame) {
        if (frame != undefined) this.anims[name].current_frame = frame;
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

    set_speed(speed) {
        this.speed = speed;
    }

}