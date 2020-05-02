

class Chip8 {
    // 0x0 - 0x1FF   | reserved for interpreter itself and font data
    // 0x200 - 0xE9F | for programs
    // 0xEA0 - 0xEFF | reserved for call stack
    // 0xF00 - 0xFFF | reserved for display refresh
    memory: Uint8Array;
    // address of current instruction in memory
    pc: number = 0x0;

    // 0x0-0xE | general registers, plus 0xF-th is used as a flag register only
    regs: Uint8Array;

    // 16-bit address register
    I: number = 0x0;

    // 12-level stack stores return addresses when subroutines are called
    stack: Uint16Array;
    // stack pointer
    sp: number = 0x0;

    // 60Hz timers, they count to zero
    delay_timer: number = 0x0;
    sound_timer: number = 0x0;

    // stores info about 16 keys, either they are pressed or not
    keys: Uint8Array;

    // stores screen pixels info, 64x32=2048
    screen: Uint8Array;
    screen_width: number = 0x40;
    screen_height: number = 0x20;

    block_until_key_pressed: number = -1;

    debug_mode: boolean = false;
    load_quirk: boolean = false;
    shift_quirk: boolean = false;

    constructor(){
        this.init();
    }

    key_process(key: number, state: number){
        this.keys[key] = state;

        // unblock if blocked
        if (state != 0 && this.block_until_key_pressed != -1) {
            this.regs[this.block_until_key_pressed] = key;
            this.block_until_key_pressed = -1;
        }
    }

    fetch_instruction() {
        // every instruction is 16-bit and is in big-endian format
        let curr_instr = this.memory[this.pc] << 8 | this.memory[this.pc+1];
        return curr_instr;
    }

    execute_instruction(instr: number){
        if (this.block_until_key_pressed != -1) {
            // do nothing and wait for key press
            return;
        }

        let instruction_types = [ this.x0,this.x1,this.x2,this.x3,
                                this.x4,this.x5,this.x6,this.x7,
                                this.x8,this.x9,this.xA,this.xB,
                                this.xC,this.xD,this.xE,this.xF ];

        instruction_types[instr >> 12 & 0xF].call(this, instr >> 8 & 0xF, instr >> 4 & 0xF, instr >> 0 & 0xF);
    }

    clearScreen(){
        for (let i = 0; i < this.screen.length; i++) 
            this.screen[i] = 0;
    }

    init(){
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

    //
    // instruction zone here
    //
    x0(b1: number, b2: number, b3: number){
        // skip 0b1b2b3 (call) case

        if (b3 == 0x0) { // clear the screen
            this.clearScreen();
            this.pc += 2;

            if (this.debug_mode) console.log("D: disp_clear()  ");
        } else if (b3 == 0xE) { // return from a subroutine
            // take the address from the stack at 'sp'
            let loc = this.stack[this.sp-1];
            this.sp--;

            this.pc = loc;
            this.pc += 2;

            if (this.debug_mode) console.log("D: return;  ");
        }

    }


    x1(b1: number, b2: number, b3: number){
        // jump to b1b2b3
        let new_loc = b1 << 8 | b2 << 4 | b3;
        this.pc = new_loc;

        if (this.debug_mode) console.log("D: goto NNN; ");
    }


    x2(b1: number, b2: number, b3: number){
        // call subroutine at b1b2b3
        let new_loc = b1 << 8 | b2 << 4 | b3;
        // save current address at stack
        this.stack[this.sp] = this.pc;
        this.sp++;
        this.pc = new_loc;

        if (this.debug_mode) console.log("D: *(0xNNN)() ");
    }


    x3(b1: number, b2: number, b3: number){
        // skip next instruction if regs[b1] == b2b3
        if (this.regs[b1] == (b2 << 4 | b3)) {
            this.pc += 4;
        } else {
            this.pc += 2;
        }

        if (this.debug_mode) console.log("D: if(Vx==NN)  ");
    }

    x4(b1: number, b2: number, b3: number){
        // skip next instruction if regs[b1] != b2b3
        if (this.regs[b1] != (b2 << 4 | b3)) {
            this.pc += 4;
        } else {
            this.pc += 2;
        }

        if (this.debug_mode) console.log("D: if(Vx!=NN)  ");
    }


    x5(b1: number, b2: number, b3: number){
        // skip next instruction if regs[b1] == regs[b2]
        if (this.regs[b1] == this.regs[b2]){
            this.pc += 4;
        } else {
            this.pc += 2;
        }

        if (this.debug_mode) console.log("D: if(Vx==Vy)  ");
    }


    x6(b1: number, b2: number, b3: number){
        // set regs[b1] to b2b3
        this.regs[b1] = b2 << 4 | b3;
        this.pc += 2;

        if (this.debug_mode) console.log("D: Vx = NN ");
    }


    x7(b1: number, b2: number, b3: number){
        // add b2b3 to regs[b1]; carry flag is not changed
        this.regs[b1] += b2 << 4 | b3;
        this.pc += 2;

        if (this.debug_mode) console.log("D: Vx += NN ");
    }


    x8(b1: number, b2: number, b3: number){
        switch (b3) {
            case 0x0:
                // set regs[b1] to the value of regs[b2]
                this.regs[b1] = this.regs[b2];
                if (this.debug_mode) console.log("D: Vx=Vy ");
                break;
            case 0x1:
                // set regs[b1] to bitwise OR of regs[b1] and regs[b2]
                this.regs[b1] |= this.regs[b2];
                if (this.debug_mode) console.log("D: Vx=Vx|Vy ");
                break;
            case 0x2:
                // set regs[b1] to bitwise AND of regs[b1] and regs[b2]
                this.regs[b1] &= this.regs[b2];
                if (this.debug_mode) console.log("D: Vx=Vx&Vy");
                break;
            case 0x3:
                // set regs[b1] to bitwise XOR of regs[b1] and regs[b2]
                this.regs[b1] ^= this.regs[b2];
                if (this.debug_mode) console.log("D: Vx=Vx^Vy ");
                break;
            case 0x4:
                // add regs[b2] to regs[b1]. regs[0xF] set to 1 if there's carry, and 0 otherwise
                if (this.regs[b1] + this.regs[b2] > 0xFF)
                    this.regs[0xF] = 0x1;
                else
                    this.regs[0xF] = 0x0;

                this.regs[b1] += this.regs[b2];
                if (this.debug_mode) console.log("D: Vx += Vy ");
                break;
            case 0x5:
                // subtracts regs[b2] from regs[b1]. regs[0xF] set to 0 if there's borrow, and 1 otherwise
                if (this.regs[b1] - this.regs[b2] < 0x0)
                    this.regs[0xF] = 0x0;
                else
                    this.regs[0xF] = 0x1;
                    
                this.regs[b1] -= this.regs[b2];
                if (this.debug_mode) console.log("D: Vx -= Vy  ");
                break;
            case 0x6:
                // store the least significant bit of regs[b1] in regs[0xF] and shift regs[b1] to the right by 1 bit

                // modify only regs[b1]
                if (this.shift_quirk) {
                    this.regs[0xF] = this.regs[b1] & 0x1;
                    this.regs[b1] >>= 0x1;
                } else {
                    this.regs[0xF] = this.regs[b2] & 0x1;
                    this.regs[b1] = (this.regs[b2] >>= 0x1);
                }
                
                if (this.debug_mode) console.log("D: Vx>>=1 ");
                break;
            case 0x7:
                // set regs[b1] to regs[b2] - regs[b1]. regs[0xF] set to 0 if there's a borrow, and 1 otherwise
                if (this.regs[b2] - this.regs[b1] < 0x0)
                    this.regs[0xF] = 0x0;
                else
                    this.regs[0xF] = 0x1;
                    
                this.regs[b1] = this.regs[b2] - this.regs[b1];
                if (this.debug_mode) console.log("D: Vx=Vy-Vx  ");
                break;
            case 0xE:
                // store the most significant bit of regs[b1] in regs[0xF] and shift regs[b1] to the left by 1 bit
                // this.regs[0xF] = this.regs[b1] >> 0x7 & 0x1;
                // this.regs[b1] <<= 0x1;


                // modify only regs[b1]
                if (this.shift_quirk) {
                    this.regs[0xF] = this.regs[b1] >> 0x7 & 0x1;
                    this.regs[b1] <<= 0x1;
                } else {
                    this.regs[0xF] = this.regs[b2] >> 0x7 & 0x1;
                    this.regs[b1] = (this.regs[b2] <<= 0x1);
                }

                if (this.debug_mode) console.log("D: Vx<<=1 ");
                break;
        }

        this.pc += 2;
    }



    x9(b1: number, b2: number, b3: number){
        // skip the next instruction if regs[b1] != regs[b2]
        if (this.regs[b1] != this.regs[b2]){
            this.pc += 4;
        } else {
            this.pc += 2;
        }

        if (this.debug_mode) console.log("D: if(Vx!=Vy)  ");
    }


    xA(b1: number, b2: number, b3: number){
        // set I to the address b1b2b3
        this.I = b1 << 8 | b2 << 4 | b3;
        this.pc += 2;

        if (this.debug_mode) console.log("D: I = NNN  ");
    }


    xB(b1: number, b2: number, b3: number){
        // jump to the address b1b2b3 plus regs[0x0]
        this.pc = b1 << 8 | b2 << 4 | b3;
        this.pc += this.regs[0x0];

        if (this.debug_mode) console.log("D: PC=V0+NNN  ");
    }



    xC(b1: number, b2: number, b3: number){
        // set regs[b1] to the result of bitwise AND on random number (0-255) and b2b3
        this.regs[b1] = Math.floor(Math.random() * 256) & (b2 << 4 | b3)
        this.pc += 2;

        if (this.debug_mode) console.log("D: Vx=rand()&NN ");
    }


    xD(b1: number, b2: number, b3: number){
        // Draws a sprite at coordinate (regs[b1], regs[b2]) that has a width of 8 pixels and a height of b3 pixels
        // Each row of 8 pixels is read as BIT-CODED starting from memory location I;
        // I value doesn’t change after the execution of this instruction.
        // VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that doesn’t happen 
        this.regs[0xF] = 0;
        let loc = this.I;
        let height = b3;
        let start_x = this.regs[b1];
        let start_y = this.regs[b2];

        // go through height pixels
        for (let y = 0; y < height; y++){
            
            // go through 8 width bits
            for (let x = 0; x < 8; x++) {
                // get certain bit from 1 byte memory
                let bit = this.memory[loc] >> (7-x) & 0x1;
                
                // skip if pixel is outside of screen
                if (start_x + x >= this.screen_width || start_x + x < 0 || 
                        start_y + y >= this.screen_height || start_y + y < 0)
                    continue;

                let index = (start_x + x) + (start_y + y) * this.screen_width;
                
                // collision detection
                if (this.screen[index] != 0 && bit != 0) {
                    this.regs[0xF] = 1;
                }

                this.screen[index] ^= bit;

            }
            loc++;
        }

        this.pc += 2;

        if (this.debug_mode) console.log(`D: draw(x=V${b1},y=V${b2},H=${b3}) `);
    }
    
        
    xE(b1: number, b2: number, b3: number){
        let b2b3 = b2 << 4 | b3;

        if (b2b3 == 0x9E) {
            // skip the next instruction if keys[regs[b1]] is pressed

            if (this.keys[this.regs[b1]] == 1){
                this.pc += 4;
            } else {
                this.pc += 2;
            }

            if (this.debug_mode) console.log(`D: if(key()==V${b1}) `);
            
        } else if (b2b3 == 0xA1) {
            // skip the next instruction if keys[regs[b1]] is not pressed
            
            if (this.keys[this.regs[b1]] == 0){
                this.pc += 4;
            } else {
                this.pc += 2;
            }

            if (this.debug_mode) console.log(`D: if(key()!=V${b1}) `);
        }
        
    }


    xF(b1: number, b2: number, b3: number){

        switch (b2 << 4 | b3){
            case 0x07:
                // set regs[b1] to the value of the delay timer
                this.regs[b1] = this.delay_timer;
                if (this.debug_mode) console.log(`D: Vx = get_delay() `);
            break;
            case 0x0A:
                // block until a key pressed, then store it to regs[b1]
                this.block_until_key_pressed = b1;
                if (this.debug_mode) console.log(`D: Vx = get_key() `);
            break;
            case 0x15:
                // set the delay timer to regs[b1]
                this.delay_timer = this.regs[b1];
                if (this.debug_mode) console.log(`D: delay_timer(V${b1}) `);
            break;
            case 0x18:
                // set the sound timer to regs[b1]
                this.sound_timer = this.regs[b1];
                if (this.debug_mode) console.log(`D: sound_timer(V${b1}) `);
            break;
            case 0x1E:
                // add regs[b1] to I, regs[0xF] set to 1 if there's a range overflow (regs[b1]+I > 0xFFF), and 0 otherwise
                if (this.regs[b1] + this.I > 0xFFF)
                    this.regs[0xF] = 1;
                else
                    this.regs[0xF] = 0;

                this.I += this.regs[b1];
                if (this.debug_mode) console.log(`D: I += V${b1} `);
            break;
            case 0x29:
                // set I to the location of the sprite for the character in regs[b1]. Characters 0-F are represented by 4x5 font
                //
                this.I = this.get_character_location(this.regs[b1]);
                if (this.debug_mode) console.log(`D: I=sprite_addr[V${b1}] `);
            break;
            case 0x33:
                // store the binary-coded decimal (ABC) representation of regs[b1] in I (for A), I+1 (for B), and I+2 (for C)
                let A = Math.floor(this.regs[b1] / 100);
                let B = Math.floor((this.regs[b1] % 100) / 10);
                let C = this.regs[b1] % 10;

                this.memory[this.I] = A;
                this.memory[this.I+1] = B;
                this.memory[this.I+2] = C;
                if (this.debug_mode) console.log(`D: set_BCD(V${b1}); ${A} ${B} ${C}`);
            break;
            case 0x55:
                // store regs[0x0] to regs[b1] (including) in memory starting at I. I is unmodified
                for (let i = 0x0; i <= b1; i++){
                    this.memory[this.I + i] = this.regs[i];
                } 

                if (!this.load_quirk) {
                    this.I += b1;
                }

                if (this.debug_mode) console.log(`D: reg_dump(V${b1},&I)`);
            break;
            case 0x65:
                // fill regs[0x0] to regs[b1] (including) with values from memory starting at I. I is unmodified
                for (let i = 0x0; i <= b1; i++){
                    this.regs[i] = this.memory[this.I + i];
                } 
                if (!this.load_quirk) {
                    this.I += b1;
                }

                if (this.debug_mode) console.log(`D: reg_load(V${b1},&I) `);
            break;
        }

        this.pc += 2;
    }



    get_character_location(char: number){
        // each char weights 5 bytes
        return 0x0 + char * 5;
    }

    store_font_data(){
        // store font in memory 0x0 - 0x50
        let characters = [ 
            // 0
            0b11110000,
            0b10010000,
            0b10010000,
            0b10010000,
            0b11110000,
            // 1
            0b00100000,
            0b01100000,
            0b00100000,
            0b00100000,
            0b01110000,
            // 2
            0b11110000,
            0b00010000,
            0b11110000,
            0b10000000,
            0b11110000,
            // 3
            0b11110000,
            0b00010000,
            0b11110000,
            0b00010000,
            0b11110000,
            // 4
            0b10010000,
            0b10010000,
            0b11110000,
            0b00010000,
            0b00010000,
            // 5
            0b11110000,
            0b10000000,
            0b11110000,
            0b00010000,
            0b11110000,
            // 6
            0b11110000,
            0b10000000,
            0b11110000,
            0b10010000,
            0b11110000,
            // 7
            0b11110000,
            0b00010000,
            0b00100000,
            0b01000000,
            0b01000000,
            // 8
            0b11110000,
            0b10010000,
            0b11110000,
            0b10010000,
            0b11110000,
            // 9
            0b11110000,
            0b10010000,
            0b11110000,
            0b00010000,
            0b11110000,
            // A
            0b11110000,
            0b10010000,
            0b11110000,
            0b10010000,
            0b10010000,
            // B
            0b11100000,
            0b10010000,
            0b11100000,
            0b10010000,
            0b11100000,
            // C
            0b11110000,
            0b10000000,
            0b10000000,
            0b10000000,
            0b11110000,
            // D
            0b11100000,
            0b10010000,
            0b10010000,
            0b10010000,
            0b11100000,
            // E
            0b11110000,
            0b10000000,
            0b11110000,
            0b10000000,
            0b11110000,
            // F
            0b11110000,
            0b10000000,
            0b11110000,
            0b10000000,
            0b10000000
            ];

        for (let i = 0; i < characters.length; i++){
            this.memory[i] = characters[i];
        }

    }

    load_rom(rom: Uint8Array) {
        // load rom and copy it to memory
        // set pc to start location
        let start_location = 0x200;
        for (let i = 0; i < rom.byteLength; i++){
            this.memory[start_location + i] = rom[i];
        }

        this.pc = start_location;
    }
}


