class Chip8 {
    constructor() {
        this.pc = 0x0;
        this.I = 0x0;
        this.sp = 0x0;
        this.delay_timer = 0x0;
        this.sound_timer = 0x0;
        this.screen_width = 0x40;
        this.screen_height = 0x20;
        this.block_until_key_pressed = -1;
        this.debug_mode = false;
        this.load_quirk = false;
        this.shift_quirk = false;
        this.init();
    }
    key_process(key, state) {
        this.keys[key] = state;
        if (state != 0 && this.block_until_key_pressed != -1) {
            this.regs[this.block_until_key_pressed] = key;
            this.block_until_key_pressed = -1;
        }
    }
    fetch_instruction() {
        let curr_instr = this.memory[this.pc] << 8 | this.memory[this.pc + 1];
        return curr_instr;
    }
    execute_instruction(instr) {
        if (this.block_until_key_pressed != -1) {
            return;
        }
        let instruction_types = [this.x0, this.x1, this.x2, this.x3,
            this.x4, this.x5, this.x6, this.x7,
            this.x8, this.x9, this.xA, this.xB,
            this.xC, this.xD, this.xE, this.xF];
        instruction_types[instr >> 12 & 0xF].call(this, instr >> 8 & 0xF, instr >> 4 & 0xF, instr >> 0 & 0xF);
    }
    clearScreen() {
        for (let i = 0; i < this.screen.length; i++)
            this.screen[i] = 0;
    }
    init() {
        this.memory = new Uint8Array(0x1000);
        this.regs = new Uint8Array(0x10);
        this.stack = new Uint16Array(0xC);
        this.keys = new Uint8Array(0x10);
        this.screen = new Uint8Array(0x800);
        this.store_font_data();
        this.pc = 0x0;
        this.I = 0x0;
        this.sp = 0x0;
        this.delay_timer = 0x0;
        this.sound_timer = 0x0;
        this.block_until_key_pressed = -1;
        this.clearScreen();
    }
    x0(b1, b2, b3) {
        if (b3 == 0x0) {
            this.clearScreen();
            this.pc += 2;
            if (this.debug_mode)
                console.log("D: disp_clear()  ");
        }
        else if (b3 == 0xE) {
            let loc = this.stack[this.sp - 1];
            this.sp--;
            this.pc = loc;
            this.pc += 2;
            if (this.debug_mode)
                console.log("D: return;  ");
        }
    }
    x1(b1, b2, b3) {
        let new_loc = b1 << 8 | b2 << 4 | b3;
        this.pc = new_loc;
        if (this.debug_mode)
            console.log("D: goto NNN; ");
    }
    x2(b1, b2, b3) {
        let new_loc = b1 << 8 | b2 << 4 | b3;
        this.stack[this.sp] = this.pc;
        this.sp++;
        this.pc = new_loc;
        if (this.debug_mode)
            console.log("D: *(0xNNN)() ");
    }
    x3(b1, b2, b3) {
        if (this.regs[b1] == (b2 << 4 | b3)) {
            this.pc += 4;
        }
        else {
            this.pc += 2;
        }
        if (this.debug_mode)
            console.log("D: if(Vx==NN)  ");
    }
    x4(b1, b2, b3) {
        if (this.regs[b1] != (b2 << 4 | b3)) {
            this.pc += 4;
        }
        else {
            this.pc += 2;
        }
        if (this.debug_mode)
            console.log("D: if(Vx!=NN)  ");
    }
    x5(b1, b2, b3) {
        if (this.regs[b1] == this.regs[b2]) {
            this.pc += 4;
        }
        else {
            this.pc += 2;
        }
        if (this.debug_mode)
            console.log("D: if(Vx==Vy)  ");
    }
    x6(b1, b2, b3) {
        this.regs[b1] = b2 << 4 | b3;
        this.pc += 2;
        if (this.debug_mode)
            console.log("D: Vx = NN ");
    }
    x7(b1, b2, b3) {
        this.regs[b1] += b2 << 4 | b3;
        this.pc += 2;
        if (this.debug_mode)
            console.log("D: Vx += NN ");
    }
    x8(b1, b2, b3) {
        switch (b3) {
            case 0x0:
                this.regs[b1] = this.regs[b2];
                if (this.debug_mode)
                    console.log("D: Vx=Vy ");
                break;
            case 0x1:
                this.regs[b1] |= this.regs[b2];
                if (this.debug_mode)
                    console.log("D: Vx=Vx|Vy ");
                break;
            case 0x2:
                this.regs[b1] &= this.regs[b2];
                if (this.debug_mode)
                    console.log("D: Vx=Vx&Vy");
                break;
            case 0x3:
                this.regs[b1] ^= this.regs[b2];
                if (this.debug_mode)
                    console.log("D: Vx=Vx^Vy ");
                break;
            case 0x4:
                if (this.regs[b1] + this.regs[b2] > 0xFF)
                    this.regs[0xF] = 0x1;
                else
                    this.regs[0xF] = 0x0;
                this.regs[b1] += this.regs[b2];
                if (this.debug_mode)
                    console.log("D: Vx += Vy ");
                break;
            case 0x5:
                if (this.regs[b1] - this.regs[b2] < 0x0)
                    this.regs[0xF] = 0x0;
                else
                    this.regs[0xF] = 0x1;
                this.regs[b1] -= this.regs[b2];
                if (this.debug_mode)
                    console.log("D: Vx -= Vy  ");
                break;
            case 0x6:
                if (this.shift_quirk) {
                    this.regs[0xF] = this.regs[b1] & 0x1;
                    this.regs[b1] >>= 0x1;
                }
                else {
                    this.regs[0xF] = this.regs[b2] & 0x1;
                    this.regs[b1] = (this.regs[b2] >>= 0x1);
                }
                if (this.debug_mode)
                    console.log("D: Vx>>=1 ");
                break;
            case 0x7:
                if (this.regs[b2] - this.regs[b1] < 0x0)
                    this.regs[0xF] = 0x0;
                else
                    this.regs[0xF] = 0x1;
                this.regs[b1] = this.regs[b2] - this.regs[b1];
                if (this.debug_mode)
                    console.log("D: Vx=Vy-Vx  ");
                break;
            case 0xE:
                if (this.shift_quirk) {
                    this.regs[0xF] = this.regs[b1] >> 0x7 & 0x1;
                    this.regs[b1] <<= 0x1;
                }
                else {
                    this.regs[0xF] = this.regs[b2] >> 0x7 & 0x1;
                    this.regs[b1] = (this.regs[b2] <<= 0x1);
                }
                if (this.debug_mode)
                    console.log("D: Vx<<=1 ");
                break;
        }
        this.pc += 2;
    }
    x9(b1, b2, b3) {
        if (this.regs[b1] != this.regs[b2]) {
            this.pc += 4;
        }
        else {
            this.pc += 2;
        }
        if (this.debug_mode)
            console.log("D: if(Vx!=Vy)  ");
    }
    xA(b1, b2, b3) {
        this.I = b1 << 8 | b2 << 4 | b3;
        this.pc += 2;
        if (this.debug_mode)
            console.log("D: I = NNN  ");
    }
    xB(b1, b2, b3) {
        this.pc = b1 << 8 | b2 << 4 | b3;
        this.pc += this.regs[0x0];
        if (this.debug_mode)
            console.log("D: PC=V0+NNN  ");
    }
    xC(b1, b2, b3) {
        this.regs[b1] = Math.floor(Math.random() * 256) & (b2 << 4 | b3);
        this.pc += 2;
        if (this.debug_mode)
            console.log("D: Vx=rand()&NN ");
    }
    xD(b1, b2, b3) {
        this.regs[0xF] = 0;
        let loc = this.I;
        let height = b3;
        let start_x = this.regs[b1];
        let start_y = this.regs[b2];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < 8; x++) {
                let bit = this.memory[loc] >> (7 - x) & 0x1;
                if (start_x + x >= this.screen_width || start_x + x < 0 ||
                    start_y + y >= this.screen_height || start_y + y < 0)
                    continue;
                let index = (start_x + x) + (start_y + y) * this.screen_width;
                if (this.screen[index] != 0 && bit != 0) {
                    this.regs[0xF] = 1;
                }
                this.screen[index] ^= bit;
            }
            loc++;
        }
        this.pc += 2;
        if (this.debug_mode)
            console.log(`D: draw(x=V${b1},y=V${b2},H=${b3}) `);
    }
    xE(b1, b2, b3) {
        let b2b3 = b2 << 4 | b3;
        if (b2b3 == 0x9E) {
            if (this.keys[this.regs[b1]] == 1) {
                this.pc += 4;
            }
            else {
                this.pc += 2;
            }
            if (this.debug_mode)
                console.log(`D: if(key()==V${b1}) `);
        }
        else if (b2b3 == 0xA1) {
            if (this.keys[this.regs[b1]] == 0) {
                this.pc += 4;
            }
            else {
                this.pc += 2;
            }
            if (this.debug_mode)
                console.log(`D: if(key()!=V${b1}) `);
        }
    }
    xF(b1, b2, b3) {
        switch (b2 << 4 | b3) {
            case 0x07:
                this.regs[b1] = this.delay_timer;
                if (this.debug_mode)
                    console.log(`D: Vx = get_delay() `);
                break;
            case 0x0A:
                this.block_until_key_pressed = b1;
                if (this.debug_mode)
                    console.log(`D: Vx = get_key() `);
                break;
            case 0x15:
                this.delay_timer = this.regs[b1];
                if (this.debug_mode)
                    console.log(`D: delay_timer(V${b1}) `);
                break;
            case 0x18:
                this.sound_timer = this.regs[b1];
                if (this.debug_mode)
                    console.log(`D: sound_timer(V${b1}) `);
                break;
            case 0x1E:
                if (this.regs[b1] + this.I > 0xFFF)
                    this.regs[0xF] = 1;
                else
                    this.regs[0xF] = 0;
                this.I += this.regs[b1];
                if (this.debug_mode)
                    console.log(`D: I += V${b1} `);
                break;
            case 0x29:
                this.I = this.get_character_location(this.regs[b1]);
                if (this.debug_mode)
                    console.log(`D: I=sprite_addr[V${b1}] `);
                break;
            case 0x33:
                let A = Math.floor(this.regs[b1] / 100);
                let B = Math.floor((this.regs[b1] % 100) / 10);
                let C = this.regs[b1] % 10;
                this.memory[this.I] = A;
                this.memory[this.I + 1] = B;
                this.memory[this.I + 2] = C;
                if (this.debug_mode)
                    console.log(`D: set_BCD(V${b1}); ${A} ${B} ${C}`);
                break;
            case 0x55:
                for (let i = 0x0; i <= b1; i++) {
                    this.memory[this.I + i] = this.regs[i];
                }
                if (!this.load_quirk) {
                    this.I += b1;
                }
                if (this.debug_mode)
                    console.log(`D: reg_dump(V${b1},&I)`);
                break;
            case 0x65:
                for (let i = 0x0; i <= b1; i++) {
                    this.regs[i] = this.memory[this.I + i];
                }
                if (!this.load_quirk) {
                    this.I += b1;
                }
                if (this.debug_mode)
                    console.log(`D: reg_load(V${b1},&I) `);
                break;
        }
        this.pc += 2;
    }
    get_character_location(char) {
        return 0x0 + char * 5;
    }
    store_font_data() {
        let characters = [
            0b11110000,
            0b10010000,
            0b10010000,
            0b10010000,
            0b11110000,
            0b00100000,
            0b01100000,
            0b00100000,
            0b00100000,
            0b01110000,
            0b11110000,
            0b00010000,
            0b11110000,
            0b10000000,
            0b11110000,
            0b11110000,
            0b00010000,
            0b11110000,
            0b00010000,
            0b11110000,
            0b10010000,
            0b10010000,
            0b11110000,
            0b00010000,
            0b00010000,
            0b11110000,
            0b10000000,
            0b11110000,
            0b00010000,
            0b11110000,
            0b11110000,
            0b10000000,
            0b11110000,
            0b10010000,
            0b11110000,
            0b11110000,
            0b00010000,
            0b00100000,
            0b01000000,
            0b01000000,
            0b11110000,
            0b10010000,
            0b11110000,
            0b10010000,
            0b11110000,
            0b11110000,
            0b10010000,
            0b11110000,
            0b00010000,
            0b11110000,
            0b11110000,
            0b10010000,
            0b11110000,
            0b10010000,
            0b10010000,
            0b11100000,
            0b10010000,
            0b11100000,
            0b10010000,
            0b11100000,
            0b11110000,
            0b10000000,
            0b10000000,
            0b10000000,
            0b11110000,
            0b11100000,
            0b10010000,
            0b10010000,
            0b10010000,
            0b11100000,
            0b11110000,
            0b10000000,
            0b11110000,
            0b10000000,
            0b11110000,
            0b11110000,
            0b10000000,
            0b11110000,
            0b10000000,
            0b10000000
        ];
        for (let i = 0; i < characters.length; i++) {
            this.memory[i] = characters[i];
        }
    }
    load_rom(rom) {
        let start_location = 0x200;
        for (let i = 0; i < rom.byteLength; i++) {
            this.memory[start_location + i] = rom[i];
        }
        this.pc = start_location;
    }
}
let mapped_keys = ['1', '2', '3', '4',
    'q', 'w', 'e', 'r',
    'a', 's', 'd', 'f',
    'z', 'x', 'c', 'v'];
let pixel_size;
let chip8;
let rom_loaded = false;
let addr_shift = 0;
let playing = true;
let show_emul_info = true;
let pause_emul = false;
let invert_color = false;
let emul_sound = true;
let emul_speed = 8;
let osc;
let gameList;
let gameListSelect;
function setup() {
    createCanvas(800, 700);
    frameRate(60);
    chip8 = new Chip8();
    pixel_size = createVector(width / chip8.screen_width, width / chip8.screen_width);
    osc = new p5.SqrOsc(400);
    osc.amp(0);
    osc.start();
    loadGameList();
    gameListSelect = createSelect();
    gameListSelect.option('None');
    let launchBtn = createButton("Launch");
    launchBtn.mousePressed((() => {
        var _a, _b;
        let gameName = gameListSelect.selected();
        let i = gameList.findIndex((el) => el.title === gameName);
        if (i != -1) {
            let obj = gameList[i];
            chip8.load_quirk = ((_a = obj === null || obj === void 0 ? void 0 : obj.quirks) === null || _a === void 0 ? void 0 : _a.loadStore) || false;
            chip8.shift_quirk = ((_b = obj === null || obj === void 0 ? void 0 : obj.quirks) === null || _b === void 0 ? void 0 : _b.shift) || false;
            loadGame("./chip8_games/" + obj.file);
        }
        print(gameName);
    }));
}
function loadGame(path) {
    fetch(path)
        .then(resp => {
        if (resp.ok) {
            resp.blob().then(data => {
                data.arrayBuffer().then(buffer => {
                    let array = new Uint8Array(buffer);
                    chip8.init();
                    chip8.load_rom(array);
                    addr_shift = chip8.pc - 8;
                    rom_loaded = true;
                    loop();
                });
            });
        }
        else {
            console.log(path + " doesn't exist");
            noLoop();
            return;
        }
    });
}
function loadGameList() {
    fetch("./chip8_games/roms.json").then(gamesFile => {
        gamesFile.json().then(gamesJson => {
            gameList = gamesJson;
            for (let gameEntry of gameList) {
                gameListSelect.option(gameEntry.title);
            }
        });
    });
}
function draw() {
    background(220);
    if (rom_loaded) {
        for (let i = 0; i < emul_speed; i++) {
            basic_chip8_cycle();
        }
        if (show_emul_info)
            draw_instructions();
    }
    for (let y = 0; y < chip8.screen_height; y++) {
        for (let x = 0; x < chip8.screen_width; x++) {
            let col = chip8.screen[x + y * chip8.screen_width] == 0 ? 255 : 0;
            if (invert_color) {
                col = Math.abs(col - 255);
            }
            fill(col);
            stroke(col);
            rect(x * pixel_size.x, y * pixel_size.y, pixel_size.x, pixel_size.y);
        }
    }
}
function basic_chip8_cycle(one_step_mode = false) {
    if (pause_emul && !one_step_mode)
        return;
    let instr = chip8.fetch_instruction();
    chip8.execute_instruction(instr);
    if (chip8.delay_timer > 0) {
        chip8.delay_timer--;
    }
    if (chip8.sound_timer > 0) {
        --chip8.sound_timer;
        if (emul_sound) {
            osc.amp(1, 0.2);
            osc.amp(0, 0.3);
        }
    }
}
function draw_instructions() {
    fill(0);
    stroke(0);
    textAlign(LEFT, TOP);
    textSize(30);
    let start_y = pixel_size.y * chip8.screen_height;
    text("Memory:", 0, start_y);
    for (let i = addr_shift; i < addr_shift + 17; i += 2) {
        if (i == chip8.pc)
            fill(200, 0, 0);
        let string = '0x' + chip8.memory[i].toString(16).toUpperCase() + '\t0x' + chip8.memory[i + 1].toString(16).toUpperCase();
        text(i + ') ' + string, 0, start_y + (i + 2 - addr_shift) / 2 * textSize());
        fill(0);
    }
    let start_x = width / 2;
    text("I = 0x" + chip8.I.toString(16).toUpperCase(), start_x, start_y);
    text("PC = 0x" + chip8.pc.toString(16).toUpperCase(), start_x, start_y + textSize() * 1);
    text("SP = 0x" + chip8.sp.toString(16).toUpperCase(), start_x, start_y + textSize() * 2);
    text("DTimer = 0x" + chip8.delay_timer.toString(16).toUpperCase(), start_x, start_y + textSize() * 3);
    text("Emul speed = " + emul_speed, start_x, start_y + textSize() * 4);
    textAlign(RIGHT, TOP);
    textSize(17);
    text("Registers:", width, start_y);
    for (let i = 0x0; i < chip8.regs.byteLength; i++) {
        let string = i.toString(16).toUpperCase() + ') 0x' + chip8.regs[i].toString(16).toUpperCase();
        text(string, width, start_y + (i + 1) * textSize());
    }
}
function mousePressed() {
    let row = floor(map(mouseY, 0, pixel_size.y * chip8.screen_height, 0, chip8.screen_height));
    let col = floor(map(mouseX, 0, pixel_size.x * chip8.screen_width, 0, chip8.screen_width));
}
function keyPressed() {
    let index = mapped_keys.indexOf(key);
    if (index != -1) {
        chip8.key_process(index, 1);
    }
    if (keyCode == UP_ARROW) {
        addr_shift -= 2;
    }
    else if (keyCode == DOWN_ARROW) {
        addr_shift += 2;
    }
    else if (key == ' ') {
        show_emul_info = !show_emul_info;
    }
    else if (key == 'l') {
        addr_shift = chip8.pc - 8;
    }
    else if (key == 'p') {
        pause_emul = !pause_emul;
    }
    else if (key == 'n') {
        basic_chip8_cycle(true);
    }
    else if (key == 'i') {
        invert_color = !invert_color;
    }
    else if (key == 'm') {
        emul_sound = !emul_sound;
    }
    else if (key == '+') {
        emul_speed++;
    }
    else if (key == '-') {
        emul_speed--;
    }
}
function keyReleased() {
    let index = mapped_keys.indexOf(key);
    if (index != -1) {
        chip8.key_process(index, 0);
    }
}
//# sourceMappingURL=build.js.map