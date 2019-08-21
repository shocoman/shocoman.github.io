let grid;
let number = 'Wait';
ready = false;
let mymodel;

function setup() {
  createCanvas(400, 400);
  grid = new Grid(28, 28);
  
  
  clearButton = createButton('Clear canvas');
  clearButton.mousePressed(_ => {
    number = '';
    grid.clear();
  });


  tf.loadLayersModel('model.json').then(model => {
      ready = true;
      mymodel = model;
      number = '';
  } );
}


function draw() {
  background(220);

  grid.draw();


  stroke(0);
  line(1, 1, width-1, 1);
  line(1, 1, 1, height-1);
  line(1, height-1, width-1, height-1);
  line(width-1, 1, width-1, height-1);

  fill(70,15,200);
  textSize(64);
  text(number, 32, 64 );
}


class Grid {

  constructor(w, h) {
    this.width = w;
    this.height = h;

    this.rectSize = {
      'w': (width / w),
      'h': (height / h)
    };


    this.cells = [];

    for (let w = 0; w < this.width; w++){
      let inner = []
      for (let h = 0; h < this.height; h++){
        inner.push(0); 
      }
      this.cells.push(inner);
    }

  }

  draw() {



    for (let w = 0; w < this.width; w++) {
      for (let h = 0; h < this.height; h++) {
        fill((1 - this.cells[h][w]) * 255);
        stroke((1 - this.cells[h][w]) * 255);
        rect(w * this.rectSize.w, h * this.rectSize.h, this.rectSize.w, this.rectSize.h);
      }
    }

  }

  clear() {

    for (let w = 0; w < this.width; w++) {
      for (let h = 0; h < this.height; h++) {
        this.cells[h][w] = 0;
      }
    }

  }



  putCell(level) {

    
    let w = Math.floor(mouseX / this.rectSize.w);
    let h = Math.floor(mouseY / this.rectSize.h);

    if (w < 0 || w >= this.width || h < 0 || h >= this.height) return;

    
    for (let i = h-1; i <= h+1; i++){
      for (let j = w-1; j <= w+1; j++){
        
        if (typeof this.cells[i] === 'undefined' || typeof this.cells[i][j] === 'undefined'  ){
          continue;
        }

        if (level == 0){
          this.cells[i][j] = 0;
        }
        else{

          this.cells[i][j] += level/4;
          if (this.cells[i][j] > 1){
            this.cells[i][j] = 1;
          }          
        }

      }
    }
    
    this.cells[h][w] = level;



  }

}

function mousePressed() {
  
  if (mouseButton === LEFT) {
    grid.putCell(0.7);
  } else if (mouseButton === RIGHT) {
    grid.putCell(0)
  }

}

function mouseDragged() {
  if (mouseButton === LEFT) {
    grid.putCell(1)
  } else if (mouseButton === RIGHT) {
    grid.putCell(0)
  }
}



function mouseReleased(){
  if (mouseX >= 0 && mouseX <= width
      && mouseY >= 0 && mouseY <= height){
        tensorThing();
      }
}





function tensorThing(){
  

  if (ready){

    tf.tidy(() => {

      const example = tf.tensor3d([grid.cells], [1,28,28]);
      const prediction = mymodel.predict(example);

      const arr = Array.from(prediction.dataSync());

      let num = 0;
      let prob = 0;
      for (let i = 0; i < arr.length; i++){
         if (arr[i] > prob){
           prob = arr[i];
           num = i;
         }
        
      }

      print(arr);

      number = num;
      
      prediction.argMax().print();
  })
    console.log('numTensors: ' + tf.memory().numTensors);
  }



}

