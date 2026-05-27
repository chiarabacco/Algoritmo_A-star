let cols = 20;
let rows = 10;
let grid = new Array(cols);
let openSet = [];
let closedSet = [];
let start;
let end;
let w, h;
let path = [];
let running = false;
let done = false;

// Interaction states
let draggingNode = null; // 'start', 'end', or null
let drawingWallMode = null; // true (drawing walls), false (erasing walls), null

function setup() {
  let canvas = createCanvas(1000, 500);
  canvas.parent('canvas-container');

  w = width / cols;
  h = height / rows;

  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j);
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  start = grid[3][4];
  end = grid[7][5];

  // Buttons
  document.getElementById('btn-play').addEventListener('click', startAlgorithm);
  document.getElementById('btn-reset').addEventListener('click', resetPath);
  document.getElementById('btn-clear').addEventListener('click', clearAll);
}

function startAlgorithm() {
  if (running || done) return;
  openSet = [];
  closedSet = [];
  path = [];
  openSet.push(start);
  running = true;
  done = false;
  
  // Reset previous scores
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].f = 0;
      grid[i][j].g = 0;
      grid[i][j].h = 0;
      grid[i][j].previous = undefined;
    }
  }
}

function resetPath() {
  running = false;
  done = false;
  openSet = [];
  closedSet = [];
  path = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].f = 0;
      grid[i][j].g = 0;
      grid[i][j].h = 0;
      grid[i][j].previous = undefined;
    }
  }
}

function clearAll() {
  resetPath();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].wall = false;
    }
  }
}

function draw() {
  background(255);

  if (running && frameCount % 3 === 0) { // Velocità animazione
    if (openSet.length > 0) {
      let winner = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[winner].f) {
          winner = i;
        }
      }

      var current = openSet[winner];

      if (current === end) {
        running = false;
        done = true;
      }

      removeFromArray(openSet, current);
      closedSet.push(current);

      let neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        if (!closedSet.includes(neighbor) && !neighbor.wall) {
          // Il costo è 1 per movimenti orizzontali/verticali, e sqrt(2) per diagonali
          let moveCost = dist(current.i, current.j, neighbor.i, neighbor.j);
          let tempG = current.g + moveCost;

          let newPath = false;
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            openSet.push(neighbor);
          }

          if (newPath) {
            neighbor.h = heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
      }
    } else {
      running = false;
      done = true; // Nessuna soluzione
    }
  }

  // Trova il percorso in tempo reale
  path = [];
  let temp = current;
  if (done) {
    temp = end;
  }
  if (temp) {
    path.push(temp);
    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }
  }

  // Disegna le celle
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show(color(255));
    }
  }

  // Disegna Closed Set (Esplorati) in blu
  for (let i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color('#9ca5f5')); // blu
  }

  // Disegna Open Set (Frontiera) in verde
  for (let i = 0; i < openSet.length; i++) {
    openSet[i].show(color('#86e4ab')); // verde menta
  }
  
  // Disegna il percorso SOLO quando la ricerca è conclusa
  if (done && path.length > 0) {
    noFill();
    stroke('#fcae51'); // arancione
    strokeWeight(6);
    beginShape();
    for (let i = 0; i < path.length; i++) {
      vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
    }
    endShape();
    
    // Freccia sull'arrivo
    if (path.length > 1) {
      let lastNode = path[1];
      let dx = end.i - lastNode.i;
      let dy = end.j - lastNode.j;
      let angle = atan2(dy, dx);
      
      push();
      translate(end.i * w + w / 2, end.j * h + h / 2);
      rotate(angle);
      fill('#fcae51'); // arancione
      noStroke();
      triangle(-8, -10, 10, 0, -8, 10);
      pop();
    }
  }

  // Disegna Partenza e Arrivo
  start.showSpecial("A", color('#fcae51')); // arancione
  end.showSpecial("B", color('#fcae51')); // arancione
  
  // Griglia bordi (bordo esterno)
  noFill();
  stroke(255); // Bianco
  strokeWeight(3);
  rect(0, 0, width, height);
}

// ----------------- INTERAZIONI MOUSE -----------------

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  if (running) return;

  let i = floor(mouseX / w);
  let j = floor(mouseY / h);
  let clickedCell = grid[i][j];

  if (clickedCell === start) {
    draggingNode = 'start';
  } else if (clickedCell === end) {
    draggingNode = 'end';
  } else {
    // Inizia a disegnare o cancellare muri
    drawingWallMode = !clickedCell.wall;
    clickedCell.wall = drawingWallMode;
    if(done) resetPath(); // se c'era un path, puliscilo visivamente
  }
}

function mouseDragged() {
  if (mouseX < 0 || mouseX >= width || mouseY < 0 || mouseY >= height) return;
  if (running) return;

  let i = floor(mouseX / w);
  let j = floor(mouseY / h);
  let hoveredCell = grid[i][j];

  if (draggingNode === 'start') {
    if (hoveredCell !== end && !hoveredCell.wall) {
      start = hoveredCell;
      if(done) resetPath();
    }
  } else if (draggingNode === 'end') {
    if (hoveredCell !== start && !hoveredCell.wall) {
      end = hoveredCell;
      if(done) resetPath();
    }
  } else if (drawingWallMode !== null) {
    if (hoveredCell !== start && hoveredCell !== end) {
      hoveredCell.wall = drawingWallMode;
      if(done) resetPath();
    }
  }
}

function mouseReleased() {
  draggingNode = null;
  drawingWallMode = null;
}

// -----------------------------------------------------

function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a, b) {
  // Usa la distanza euclidea per permettere il movimento a 8 direzioni in modo naturale
  return dist(a.i, a.j, b.i, b.j);
}

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.neighbors = [];
  this.previous = undefined;
  this.wall = false;

  this.show = function(col) {
    if (this.wall) {
      fill(30, 41, 59); // slate-800
      noStroke();
      rect(this.i * w + 1, this.j * h + 1, w - 1, h - 1);
    } else if (col) {
      fill(col);
      noStroke();
      rect(this.i * w + 1, this.j * h + 1, w - 1, h - 1);
    }
    
    // Draw grid borders
    stroke(0); // Nero puro come nell'immagine
    strokeWeight(1);
    noFill();
    rect(this.i * w, this.j * h, w, h);
  };
  
  this.showSpecial = function(label, col) {
    fill(col);
    noStroke();
    rect(this.i * w + 1, this.j * h + 1, w - 1, h - 1);
    
    // Draw grid borders for special cells too to keep grid continuous
    stroke(0);
    strokeWeight(1);
    noFill();
    rect(this.i * w, this.j * h, w, h);
    
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textFont('Arial');
    textSize(24);
    textStyle(BOLD);
    // Leggero offset verticale (+2) per l'allineamento ottico al centro del quadrato
    text(label, this.i * w + w / 2, this.j * h + h / 2 + 2);
  }

  this.addNeighbors = function(grid) {
    let i = this.i;
    let j = this.j;
    
    // Movimenti ortogonali
    if (i < cols - 1) this.neighbors.push(grid[i + 1][j]);
    if (i > 0) this.neighbors.push(grid[i - 1][j]);
    if (j < rows - 1) this.neighbors.push(grid[i][j + 1]);
    if (j > 0) this.neighbors.push(grid[i][j - 1]);
    
    // Movimenti diagonali
    if (i > 0 && j > 0) this.neighbors.push(grid[i - 1][j - 1]);
    if (i < cols - 1 && j > 0) this.neighbors.push(grid[i + 1][j - 1]);
    if (i > 0 && j < rows - 1) this.neighbors.push(grid[i - 1][j + 1]);
    if (i < cols - 1 && j < rows - 1) this.neighbors.push(grid[i + 1][j + 1]);
  };
}
