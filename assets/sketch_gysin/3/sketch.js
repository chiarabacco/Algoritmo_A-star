let cols = 16;
let rows = 7;
let grid = new Array(cols);
let openSet = [];
let closedSet = [];
let start;
let end;
let w, h;
let path = [];
let running = false;
let done = false;

// Spaziatura per la legenda in alto
let topPadding = 75;

// Mappa esatta tratta dalle foto dell'utente
const MAP_DATA = [
  [3, 3, 3, 5, 3, 1, 1, 1, 1, 1, 3, 5, 1, 1, 8, 8], // Riga 0
  [3, 3, 5, 5, 3, 1, 8, 8, 8, 1, 3, 5, 1, 1, 8, 8], // Riga 1
  [3, 5, 5, 3, 1, 1, 8, 8, 8, 1, 1, 1, 5, 8, 8, 8], // Riga 2
  [3, 5, 1, 1, 1, 5, 8, 8, 8, 5, 3, 1, 1, 1, 5, 8], // Riga 3
  [3, 5, 1, 1, 8, 8, 8, 8, 8, 8, 5, 1, 5, 1, 5, 5], // Riga 4
  [3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 3, 3], // Riga 5
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 3, 3, 3]  // Riga 6
];

// Elementi UI
let btnPlay;

function setup() {
  let canvas = createCanvas(750, 420);
  canvas.parent('canvas-container');

  w = width / cols;
  h = (height - topPadding) / rows;

  initializeGrid();

  // Setup pulsante HTML
  btnPlay = document.getElementById('btn-play');
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (done) {
        resetSimulation();
      } else {
        running = true;
        btnPlay.innerHTML = "In calcolo...";
        btnPlay.style.opacity = "0.6";
      }
    });
  }
}

function initializeGrid() {
  openSet = [];
  closedSet = [];
  path = [];
  running = false;
  done = false;

  // Inizializza griglia
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j);
      grid[i][j].cost = MAP_DATA[j][i];
    }
  }

  // Aggiungi vicini
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  // Nuovi punti di partenza e arrivo per la mappa aggiornata
  start = grid[3][4]; // A
  end = grid[12][1];  // B

  openSet.push(start);
  
  if (btnPlay) {
    btnPlay.innerHTML = "Avvia";
    btnPlay.style.opacity = "1";
  }
}

function resetSimulation() {
  initializeGrid();
}

function draw() {
  background(255);

  // Disegna la legenda accademica in alto
  drawLegend();

  // Esegui passo-passo dell'algoritmo (rallentato per scopi didattici: 1 step ogni 8 frame)
  if (running && frameCount % 8 === 0) {
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
        if (btnPlay) {
          btnPlay.innerHTML = "Ripristina";
          btnPlay.style.opacity = "1";
        }
        console.log("Percorso ottimale trovato!");
      }

      removeFromArray(openSet, current);
      closedSet.push(current);

      let neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        if (!closedSet.includes(neighbor)) {
          let tempG = current.g + neighbor.cost;

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
      done = true;
      if (btnPlay) {
        btnPlay.innerHTML = "Ripristina";
        btnPlay.style.opacity = "1";
      }
    }
  }

  // Costruisci il percorso provvisorio o finale
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

  // Sposta la griglia sotto la legenda
  push();
  translate(0, topPadding);

  // 1. Disegna le celle con i rispettivi colori dei terreni
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].showTerrain();
    }
  }

  // 2. Disegna i bordi interni delle celle
  stroke(0);
  strokeWeight(2);
  for (let i = 0; i <= cols; i++) {
    line(i * w, 0, i * w, rows * h);
  }
  for (let j = 0; j <= rows; j++) {
    line(0, j * h, cols * w, j * h);
  }

  // 3. Disegna i numeri di costo accumulato (g) per i nodi visitati/frontiera
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let isVisited = closedSet.includes(grid[i][j]) || openSet.includes(grid[i][j]);
      grid[i][j].showCostsAndLabels(isVisited);
    }
  }

  // 4. Disegna il percorso ottimo in rosso forte (come in foto)
  if (path.length > 0) {
    noFill();
    stroke(239, 68, 68); // Rosso vivo (#ef4444)
    strokeWeight(4);
    beginShape();
    for (let i = 0; i < path.length; i++) {
      vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
    }
    endShape();

    // Disegna il punto di partenza del percorso (pallino rosso su A)
    fill(239, 68, 68);
    noStroke();
    circle(start.i * w + w / 2, start.j * h + h / 2, 10);

    // Disegna la freccia rossa sul nodo d'arrivo B
    if (done && path.length > 1) {
      let lastNode = path[1]; // Il penultimo nodo prima di arrivare a B
      let dx = end.i - lastNode.i;
      let dy = end.j - lastNode.j;
      let angle = atan2(dy, dx);
      
      push();
      translate(end.i * w + w / 2, end.j * h + h / 2);
      rotate(angle);
      fill(239, 68, 68);
      noStroke();
      // Triangolo orientato nella direzione di arrivo
      triangle(-6, -8, 8, 0, -6, 8);
      pop();
    }
  }

  // Bordone nero perimetrale della griglia (stile accademico)
  noFill();
  stroke(0);
  strokeWeight(4);
  rect(0, 0, cols * w, rows * h);

  pop();
}

function drawLegend() {
  let legendX = 20;
  let legendY = 25;
  let boxSize = 25;
  let spacing = 180;

  let terrains = [
    { name: "Sentiero", cost: 1, col: color(255) },
    { name: "Prato", cost: 3, col: color(219, 245, 162) },
    { name: "Bosco", cost: 5, col: color(93, 163, 130) },
    { name: "Montagna", cost: 8, col: color(140, 111, 92) }
  ];

  for (let i = 0; i < terrains.length; i++) {
    let tx = legendX + i * spacing;
    
    // Scatola colore
    fill(terrains[i].col);
    stroke(0);
    strokeWeight(2.5);
    rect(tx, legendY, boxSize, boxSize);

    // Testo Legenda
    fill(15, 23, 42); // slate-900
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(13);
    textStyle(BOLD);
    text(terrains[i].name, tx + boxSize + 10, legendY + 5);
    
    textSize(12);
    textStyle(NORMAL);
    fill(100);
    text("costo: " + terrains[i].cost, tx + boxSize + 10, legendY + 18);
  }
}

function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a, b) {
  // Manhattan distance
  return abs(a.i - b.i) + abs(a.j - b.j);
}

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.neighbors = [];
  this.previous = undefined;
  this.cost = 1;

  this.showTerrain = function() {
    // Colori dei terreni esatti come da foto
    if (this.cost === 1) fill(255); // Sentiero
    else if (this.cost === 3) fill(219, 245, 162); // Prato
    else if (this.cost === 5) fill(93, 163, 130); // Bosco
    else if (this.cost === 8) fill(140, 111, 92); // Montagna
    
    noStroke();
    rect(this.i * w, this.j * h, w, h);
  };
  
  this.showCostsAndLabels = function(isVisited) {
    // Disegna la lettera A per la partenza e B per l'arrivo
    if (this === start) {
      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(20);
      textStyle(BOLD);
      text("A", this.i * w + w / 2, this.j * h + h / 2);
    } else if (this === end) {
      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(20);
      textStyle(BOLD);
      text("B", this.i * w + w / 2, this.j * h + h / 2);
      
      // Se B è stato valutato, disegna il costo in piccolo in alto
      if (isVisited && this.g > 0) {
        textSize(10);
        textStyle(NORMAL);
        text(this.g, this.i * w + w / 2 - 12, this.j * h + 15);
      }
    } else if (isVisited) {
      // Disegna il costo computato g al centro della cella (come in foto)
      if (this.cost === 8 || this.cost === 5) {
        fill(255); // Contrasto bianco sulle zone scure (Montagna/Bosco)
      } else {
        fill(60);  // Grigio scuro per le zone chiare
      }
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(12);
      textStyle(NORMAL);
      text(this.g, this.i * w + w / 2, this.j * h + h / 2);
    }
  };

  this.addNeighbors = function(grid) {
    let i = this.i;
    let j = this.j;
    if (i < cols - 1) this.neighbors.push(grid[i + 1][j]);
    if (i > 0) this.neighbors.push(grid[i - 1][j]);
    if (j < rows - 1) this.neighbors.push(grid[i][j + 1]);
    if (j > 0) this.neighbors.push(grid[i][j - 1]);
  };
}

// Supporto alla scorciatoia da tastiera D
window.addEventListener("keydown", e => {
  if (e.key === "d" || e.key === "D") {
    if (done) {
      resetSimulation();
    } else {
      running = true;
      if (btnPlay) {
        btnPlay.innerHTML = "In calcolo...";
        btnPlay.style.opacity = "0.6";
      }
    }
  }
});