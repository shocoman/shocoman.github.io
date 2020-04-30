let mapped_keys =  ['1','2','3','4',
                    'q','w','e','r',
                    'a','s','d','f',
                    'z','x','c','v'];

let pixel_size: p5.Vector;
let chip8: Chip8;
let rom_loaded: boolean = false;
let addr_shift = 0;



let playing = true;
let show_emul_info = true;
let pause_emul = false;
let invert_color = false;
let emul_sound = true;
let emul_speed = 8;
let osc: p5.SinOsc;

function setup() {
    createCanvas(800, 700);
    frameRate(60)

    chip8 = new Chip8();
    pixel_size = createVector(width/chip8.screen_width, width/chip8.screen_width);

    // init beep sound
    osc = new p5.SqrOsc(400);
    osc.amp(0);
    osc.start();


    // load game
    let game_name = location.search;
    // if (game_name.length == 0) return;
    fetch("./chip8_games/"+game_name.substr(1, game_name.length).toUpperCase())
    .then(resp => {
        // print(resp);

        if (resp.ok ) {
            resp.blob().then(data => {
                data.arrayBuffer().then(buffer => {
    
                    let array = new Uint8Array(buffer);
                    chip8.load_rom(array);
                    addr_shift = chip8.pc-8;
    
                    rom_loaded = true;

                    
                    // setInterval(basic_chip8_cycle, 1);
                    // setInterval(basic_chip8_cycle, 1);
                    // setInterval(basic_chip8_cycle, 1);
                    // setInterval(basic_chip8_cycle, 1);
                    // setInterval(basic_chip8_cycle, 1);
                    // setInterval(basic_chip8_cycle, 1);

                });
            });
        } else {
            console.log("Game " + game_name + " doesn't exist");
            noLoop();
            return;
        }

    });




}



function draw() {

    background(220);

        
    if (rom_loaded) {
        //basic_chip8_cycle();
        for (let i = 0; i < emul_speed; i++){
            basic_chip8_cycle();
        }

        if (show_emul_info)
            draw_instructions();    
        // noStroke();
    }
    

    // draw screen
    
    for (let y = 0; y < chip8.screen_height; y++) {
        for (let x = 0; x < chip8.screen_width; x++) {
            let col = chip8.screen[x + y * chip8.screen_width] == 0? 255 : 0;
            if (invert_color) {
                col = Math.abs(col - 255);
            }

            fill(col);
            stroke(col);
            rect(x * pixel_size.x, y * pixel_size.y, pixel_size.x, pixel_size.y);
        }
    }

    
}





function basic_chip8_cycle(one_step_mode = false){

    if (pause_emul && !one_step_mode) return;

    let instr = chip8.fetch_instruction();
    chip8.execute_instruction(instr);


    if (chip8.delay_timer > 0) {
        chip8.delay_timer--;
    }

    if (chip8.sound_timer > 0){
        --chip8.sound_timer;
            // play_beep()

            if (emul_sound) {
                osc.amp(1, 0.2);
                osc.amp(0, 0.3);
            }
    }
}



function draw_instructions(){
    fill(0);
    stroke(0);

    textAlign(LEFT, TOP);
    textSize(30);
    
    let start_y = pixel_size.y * chip8.screen_height;
    text("Memory:", 0, start_y)
    for (let i = addr_shift; i < addr_shift + 17; i += 2) {
        if (i == chip8.pc)
            fill(200,0,0);
        
        let string = '0x'+chip8.memory[i].toString(16).toUpperCase() + '\t0x' + chip8.memory[i+1].toString(16).toUpperCase();
        text(i + ') ' + string, 0, start_y + (i+2-addr_shift)/2*textSize());
        fill(0);
    }


    // draw other info
    let start_x = width/2;
    text("I = 0x" + chip8.I.toString(16).toUpperCase(), start_x, start_y);
    text("PC = 0x" + chip8.pc.toString(16).toUpperCase(), start_x, start_y + textSize() * 1);
    text("SP = 0x" + chip8.sp.toString(16).toUpperCase(), start_x, start_y + textSize() * 2);
    text("DTimer = 0x" + chip8.delay_timer.toString(16).toUpperCase(), start_x, start_y + textSize() * 3);
    text("Emul speed = " + emul_speed, start_x, start_y + textSize() * 4);
    

    
    // draw registers
    textAlign(RIGHT, TOP);
    textSize(17);
    text("Registers:", width, start_y)
    for (let i = 0x0; i < chip8.regs.byteLength; i++) {
        let string = i.toString(16).toUpperCase() + ') 0x' + chip8.regs[i].toString(16).toUpperCase();

        text(string, width, start_y + (i+1)*textSize());
    }

}


function mousePressed(){
    let row = floor(map(mouseY, 
        0, pixel_size.y*chip8.screen_height, 0, chip8.screen_height));
    let col = floor(map(mouseX, 
        0, pixel_size.x*chip8.screen_width, 0, chip8.screen_width));

    print(col, row)
}



function keyPressed(){

    let index = mapped_keys.indexOf(key);
    if (index != -1) {
        chip8.key_process(index, 1);
    }


    if (keyCode == UP_ARROW) {
        addr_shift -= 2;
    } else if (keyCode == DOWN_ARROW) {
        addr_shift += 2;
    } else if (key == ' '){
        print('Next step!');
        // basic_chip8_cycle();
        show_emul_info = !show_emul_info;
    } else if (key == 'l'){
        addr_shift = chip8.pc - 8;
    } else if (key == 'p'){ 
        pause_emul = !pause_emul;
    } else if (key == 'n'){ 
        basic_chip8_cycle(true);
    } else if (key == 'i'){ 
        invert_color = !invert_color;
    } else if (key == 'm'){ 
        emul_sound = !emul_sound;
    } else if (key == '+'){ 
        emul_speed++;
    } else if (key == '-'){ 
        emul_speed--;
    } 


}

function keyReleased(){


    let index = mapped_keys.indexOf(key);
    if (index != -1) {
        chip8.key_process(index, 0);
    }
}