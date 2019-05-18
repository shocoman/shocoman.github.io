const mod = (x, n) => (x % n + n) % n;
let life;


function setup() {
  frameRate(30);
  createCanvas(400, 400, WEBGL);
  
  life = new GameOfLife();
  life.init();
  life.spawn_cells();
  
}


function draw() {
  background(200);
  
  life.draw();
  
  if (frameCount % 10 == 0)
    life.make_turn();
  
}



class GameOfLife {
  
  constructor() {
    
    this.field = [];
    this.next_field = [];
    
    this.width = width-300;
    this.height= height-300;
    this.depth= this.height;
    
    this.cell_width = 10;
    this.cell_height = 10;
    this.cell_depth = 10;
    
    this.cells_x = this.width / this.cell_width; 
    this.cells_y = this.height / this.cell_height;
    this.cells_z = this.depth / this.cell_depth;
  }
  
  
  init() {
    for (let i = 0; i < this.cells_x; i++) {
      this.field[i] = [];
      this.next_field[i] = [];
      for (let j = 0; j < this.cells_y; j++) {
        this.field[i][j] = [];
        this.next_field[i][j] = [];
        
        for (let k = 0; k < this.cells_z; k++) {
          this.field[i][j][k] = 0;
          this.next_field[i][j][k] = 0;
      }
      }
    }
    
  }
  
  
  draw() {
    
    orbitControl();
    
    translate(-width/8, -height/8, -height/8,);
    

    ambientLight(60, 60, 60);
    pointLight(255, 255, 10, 10, 60, 100);
	pointLight(255, 255, 10, 0, 0, 100);
    
    
    
    push();
    
    
    
    for (let i = 0; i < this.cells_x; i++) {
      push();
      
      translate(i * this.cell_width, 0, 0);
      
      for (let j = 0; j < this.cells_y; j++) {
        push();
        
        translate(0, j * this.cell_height, 0);
        
        for (let k = 0; k < this.cells_z; k++) {
          push();
        
          translate(0, 0, k * this.cell_depth);
        
          if (this.field[i][j][k] == 1) {
            fill(250,100,220);
            box(this.cell_width, this.cell_height, this.cell_depth);
          }
          
          pop();
      }
          
        pop();
      }
      
      pop();
    }
    
   
    pop();
  }
  
  

  spawn_cells() {
   
    let number = this.cells_x * this.cells_y * this.cells_z * 0.05;
    
    while (number > 0) {
      
      let x = int(random(this.cells_x));
      let y = int(random(this.cells_y));
      let z = int(random(this.cells_z));
      
      this.field[x][y][z] = 1;
      
      number -= 1; 
    }
    
  }
  
  
  count_neighbours(x, y, z) {
    let n = 0;
      
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {        
          n += this.field[mod(x+i, this.cells_x)][mod(y+j, this.cells_y)][mod(z+k, this.cells_z)];
        }
      }
    }
    n -= this.field[x][y][z];

    return n;
  }
  
  
  make_turn() {
    
    for (let x = 0; x < this.cells_x; x++) {
      for (let y = 0; y < this.cells_y; y++) {
        for (let k = 0; k < this.cells_z; k++) {
        
        let neighbours = this.count_neighbours(x, y, k);
        
        if ((this.field[x][y][k] == 1) && (neighbours <  2)) 
          this.next_field[x][y][k] = 0;
        else if ((this.field[x][y][k] == 1) && (neighbours >  3)) 
          this.next_field[x][y][k] = 0; 
        else if ((this.field[x][y][k] == 0) && (neighbours == 3)) 
          this.next_field[x][y][k] = 1;
        else 
          this.next_field[x][y][k] = this.field[x][y][k]; 


        }
      }
    }
    
    let temp = this.field;
    this.field = this.next_field;
    this.next_field = temp;
    
  }

  
  
}


function mousePressed() {
  
  //life.spawn_cells();
  //console.log(life.count_neighbours(0,2));
  //life.make_turn();
  
  life.make_turn();
  
}
