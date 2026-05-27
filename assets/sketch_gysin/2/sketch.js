// =========================================================================
// A* VS DIJKSTRA - TEXTBOOK MINIMALIST LARGE GRAPH (84 NODES)
// =========================================================================

let nodes = [], isPlaying = false, stepDelay = 6, dijkstraSolver, aStarSolver;
let startNodeId = 10;  // Nodo A (Start) - Colonna 1, Riga 3
let targetNodeId = 73; // Nodo B (Destination) - Colonna 10, Riga 3

// Collegamenti interrotti (barriera centrale) per ostacolare il cammino diretto
let rowsCount = 7;
let blockedPairs = [
  [4 * rowsCount + 2, 5 * rowsCount + 2], [4 * rowsCount + 3, 5 * rowsCount + 3], [4 * rowsCount + 4, 5 * rowsCount + 4],
  [5 * rowsCount + 2, 6 * rowsCount + 2], [5 * rowsCount + 3, 6 * rowsCount + 3], [5 * rowsCount + 4, 6 * rowsCount + 4],
  [6 * rowsCount + 2, 7 * rowsCount + 2], [6 * rowsCount + 3, 7 * rowsCount + 3], [6 * rowsCount + 4, 7 * rowsCount + 4],
  
  [4 * rowsCount + 2, 5 * rowsCount + 3], [4 * rowsCount + 3, 5 * rowsCount + 2],
  [4 * rowsCount + 3, 5 * rowsCount + 4], [4 * rowsCount + 4, 5 * rowsCount + 3],
  [5 * rowsCount + 2, 6 * rowsCount + 3], [5 * rowsCount + 3, 6 * rowsCount + 2],
  [5 * rowsCount + 3, 6 * rowsCount + 4], [5 * rowsCount + 4, 6 * rowsCount + 3],
  [6 * rowsCount + 2, 7 * rowsCount + 3], [6 * rowsCount + 3, 7 * rowsCount + 2],
  [6 * rowsCount + 3, 7 * rowsCount + 4], [6 * rowsCount + 4, 7 * rowsCount + 3]
];

function setup() {
  createCanvas(1200, 500).parent('canvas-container');
  randomSeed(42);
  
  // Generazione organica di 84 nodi (12 colonne x 7 righe)
  let cols = 12, rows = 7;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let id = c * rows + r;
      nodes.push({
        id,
        x: map(c, 0, cols - 1, 40, 560) + random(-6, 6),
        y: map(r, 0, rows - 1, 90, 430) + random(-6, 6),
        neighbors: []
      });
    }
  }
  
  // Collegamento reticolare (orizzontale, verticale, diagonale)
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let id = c * rows + r, n = nodes[id];
      if (c < cols - 1) n.neighbors.push((c + 1) * rows + r);
      if (r < rows - 1) n.neighbors.push(c * rows + (r + 1));
      if (c < cols - 1 && r < rows - 1) n.neighbors.push((c + 1) * rows + (r + 1));
      if (c < cols - 1 && r > 0) n.neighbors.push((c + 1) * rows + (r - 1));
    }
  }
  
  // Gestione dell'evento tastiera 'D' (ascoltato sia nell'iframe che nella finestra principale)
  window.addEventListener("keydown", handleKeyboardTrigger);
  try {
    if (window.parent) {
      window.parent.addEventListener("keydown", handleKeyboardTrigger);
    }
  } catch (e) {
    // Ignora errori di cross-origin
  }
  
  // Collegamento al pulsante HTML "Avvia"
  let btn = document.getElementById('btn-play');
  if (btn) {
    btn.addEventListener('click', () => {
      resetSolvers();
      isPlaying = true;
    });
  }
  
  resetSolvers();
}

function handleKeyboardTrigger(e) {
  if (e.key === 'd' || e.key === 'D') {
    resetSolvers();
    isPlaying = true;
  }
}

function resetSolvers() {
  dijkstraSolver = new PathSolver(nodes, startNodeId, targetNodeId, false);
  aStarSolver = new PathSolver(nodes, startNodeId, targetNodeId, true);
  isPlaying = false;
}

function stepSolvers() {
  if (!dijkstraSolver.finished) dijkstraSolver.step();
  if (!aStarSolver.finished) aStarSolver.step();
  return !dijkstraSolver.finished || !aStarSolver.finished;
}

function draw() {
  background(255); // Sfondo bianco pulitissimo
  
  // Avanzamento calcolo contemporaneo
  if (isPlaying && frameCount % stepDelay === 0) {
    let active = stepSolvers();
    if (!active) isPlaying = false;
  }
  
  // Linea di divisione centrale semplice e pulita
  stroke(241, 245, 249); strokeWeight(2);
  line(width/2, 0, width/2, height);
  
  // Rendering dei grafi side-by-side
  push(); drawGraph(dijkstraSolver, false); pop();
  push(); translate(width/2, 0); drawGraph(aStarSolver, true); pop();
  
  // Barra di testo superiore
  drawTopBar();
}

function drawTopBar() {
  // Sfondo barra di testo bianco con bordo nero
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(-1, -1, width + 2, 55);
  
  // Linea di divisione al centro
  line(width/2, 0, width/2, 55);
  
  // Testo Dijkstra (Sinistra)
  noStroke(); fill(0); textSize(14); textAlign(LEFT, CENTER); textStyle(BOLD);
  text("Algoritmo DIJKSTRA", 30, 27);
  
  textStyle(NORMAL); fill(100);
  text("(Senza Euristica)", 195, 27);
  
  textStyle(BOLD); fill(34, 197, 94); // Verde per i nodi esplorati
  text("Nodi Esaminati: " + dijkstraSolver.exploredCount, 385, 27);
  
  // Testo A* (Destra)
  fill(0);
  text("Algoritmo A*", width/2 + 30, 27);
  
  textStyle(NORMAL); fill(100);
  text("(Con Euristica H)", width/2 + 130, 27);
  
  textStyle(BOLD); fill(34, 197, 94); // Verde per i nodi esplorati
  text("Nodi Esaminati: " + aStarSolver.exploredCount, width/2 + 385, 27);
}

function drawGraph(solver, isAStar) {
  // 1. DISEGNO ARCHI (Semplici linee nere sottili come da immagine)
  stroke(0); strokeWeight(0.5);
  for (let n of nodes) {
    for (let nid of n.neighbors) {
      if (n.id < nid) {
        if (!isEdgeBlocked(n.id, nid)) {
          // Disegna solo archi attivi
          line(n.x, n.y, nodes[nid].x, nodes[nid].y);
        }
      }
    }
  }
  
  // 2. EVIDENZIAZIONE DEL PERCORSO OTTENUTO (Sotto ai cerchi dei nodi)
  if (solver.pathFound) {
    stroke(isAStar ? color(37, 99, 235) : color(79, 70, 229)); // Blu o Viola indaco
    strokeWeight(4); strokeJoin(ROUND); noFill();
    beginShape();
    solver.path.forEach(id => vertex(nodes[id].x, nodes[id].y));
    endShape();
  }
  
  // 3. DISEGNO DEI NODI (Cerchi con bordo nero)
  for (let n of nodes) {
    let isStart = (n.id === startNodeId), isTarget = (n.id === targetNodeId);
    let fillColor = color(255);
    let strokeColor = color(0);
    let sw = 1;
    let size = 15; // Diametro compatto perfetto per la densità di 84 nodi
    
    // Verde per i nodi calcolati
    if (solver.closedSet.has(n.id) && !isStart && !isTarget) {
      fillColor = color(220, 252, 231); // #dcfce7
      strokeColor = color(34, 197, 94); // #22c55e
      sw = 1.5;
    }
    // Arancione per i nodi presi in considerazione (frontiera)
    else if (solver.openSet.includes(n.id) && !isStart && !isTarget) {
      fillColor = color(254, 237, 222); // #ffedd5
      strokeColor = color(249, 115, 22); // #f97316
      sw = 1.5;
    }
    
    // Evidenziazione nodo corrente in esame
    if (solver.currentId === n.id && !isTarget && !solver.finished && solver.openSet.length > 0) {
      strokeColor = color(0); sw = 2.5;
    }
    
    // Stile speciale per Partenza e Arrivo
    if (isStart) {
      fillColor = color(239, 246, 255); // Blu chiarissimo
      strokeColor = color(59, 130, 246);
      sw = 2;
      size = 20;
    } else if (isTarget) {
      fillColor = color(255, 241, 242); // Rosso chiarissimo
      strokeColor = color(239, 68, 68);
      sw = 2;
      size = 20;
    }
    
    // Disegna cerchio
    fill(fillColor); stroke(strokeColor); strokeWeight(sw);
    ellipse(n.x, n.y, size, size);
    
    // Lettera interna per A e B in nero
    if (isStart || isTarget) {
      noStroke(); fill(0); textSize(11); textStyle(BOLD); textAlign(CENTER, CENTER);
      text(isStart ? "A" : "B", n.x, n.y + 0.5);
    }
    
    // Etichette "Start" e "Destination"
    if (isStart) {
      textSize(11); textStyle(NORMAL); fill(100);
      text("Start", n.x, n.y + 24);
    } else if (isTarget) {
      textSize(11); textStyle(NORMAL); fill(100);
      text("Destination", n.x, n.y - 24);
    }
  }
}

function isEdgeBlocked(idA, idB) {
  return blockedPairs.some(p => (p[0] === idA && p[1] === idB) || (p[0] === idB && p[1] === idA));
}

// =========================================================================
// RISOLUTORE COMPATTO DI PERCORSI
// =========================================================================
class PathSolver {
  constructor(nodes, startId, targetId, useHeuristic) {
    this.nodes = nodes; this.startId = startId; this.targetId = targetId; this.useHeuristic = useHeuristic;
    this.openSet = [startId]; this.closedSet = new Set(); this.cameFrom = {};
    
    this.gScore = Object.fromEntries(nodes.map(n => [n.id, Infinity]));
    this.fScore = Object.fromEntries(nodes.map(n => [n.id, Infinity]));
    this.gScore[startId] = 0;
    this.fScore[startId] = this.heuristic(startId, targetId);
    
    this.finished = false; this.pathFound = false; this.path = [];
    this.currentId = startId; this.exploredCount = 0;
  }
  
  heuristic(a, b) {
    return this.useHeuristic ? dist(this.nodes[a].x, this.nodes[a].y, this.nodes[b].x, this.nodes[b].y) : 0;
  }
  
  step() {
    if (this.finished) return;
    if (this.openSet.length === 0) {
      this.finished = true;
      return;
    }
    
    let currentId = this.openSet.reduce((minId, id) => this.fScore[id] < this.fScore[minId] ? id : minId, this.openSet[0]);
    this.currentId = currentId;
    
    if (currentId === this.targetId) {
      this.finished = this.pathFound = true;
      this.path = [currentId];
      while (currentId in this.cameFrom) {
        currentId = this.cameFrom[currentId];
        this.path.unshift(currentId);
      }
      return;
    }
    
    this.openSet.splice(this.openSet.indexOf(currentId), 1);
    this.closedSet.add(currentId);
    this.exploredCount++;
    
    for (let nid of this.nodes[currentId].neighbors) {
      if (this.closedSet.has(nid) || isEdgeBlocked(currentId, nid)) continue;
      
      let tentative_g = this.gScore[currentId] + dist(this.nodes[currentId].x, this.nodes[currentId].y, this.nodes[nid].x, this.nodes[nid].y);
      if (tentative_g < this.gScore[nid]) {
        this.cameFrom[nid] = currentId;
        this.gScore[nid] = tentative_g;
        this.fScore[nid] = tentative_g + this.heuristic(nid, this.targetId);
        if (!this.openSet.includes(nid)) {
          this.openSet.push(nid);
        }
      }
    }
  }
}