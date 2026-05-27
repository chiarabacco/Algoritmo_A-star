let nodes = [];
let edges = [];
let nodeRadius = 20;

function setup() {
  createCanvas(600, 300).parent('canvas-container');
  
  // Creazione manuale di 6 nodi per un look pulito e compatto
  nodes = [
    { x: 75, y: 150 },  // 0: Sinistra
    { x: 200, y: 75 },  // 1: Alto sx
    { x: 200, y: 225 }, // 2: Basso sx
    { x: 375, y: 75 },  // 3: Alto dx
    { x: 375, y: 225 }, // 4: Basso dx
    { x: 500, y: 150 }  // 5: Destra
  ];
  
  // Definizione degli archi (collegamenti)
  edges = [
    { u: 0, v: 1 },
    { u: 0, v: 2 },
    { u: 1, v: 3 },
    { u: 2, v: 4 },
    { u: 1, v: 2 }, // Collegamento verticale
    { u: 3, v: 4 }, // Collegamento verticale
    { u: 2, v: 3 }, // Diagonale incrociata
    { u: 3, v: 5 },
    { u: 4, v: 5 }
  ];
}

// Funzione matematica per calcolare la distanza punto-segmento
function distToSegment(px, py, x1, y1, x2, y2) {
  let l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return dist(px, py, x1, y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
}

function draw() {
  background(240, 240, 240); // Colore di sfondo della pagina principale (#f0f0f0)
  
  let hoveredNode = -1;
  let hoveredEdge = -1;
  
  // Rilevamento hover sui nodi (priorità maggiore)
  for (let i = 0; i < nodes.length; i++) {
    if (dist(mouseX, mouseY, nodes[i].x, nodes[i].y) < nodeRadius) {
      hoveredNode = i;
      break;
    }
  }
  
  // Rilevamento hover sugli archi (solo se non si è sopra un nodo)
  if (hoveredNode === -1) {
    for (let i = 0; i < edges.length; i++) {
      let n1 = nodes[edges[i].u];
      let n2 = nodes[edges[i].v];
      let d = distToSegment(mouseX, mouseY, n1.x, n1.y, n2.x, n2.y);
      if (d < 12) { // Raggio d'azione dell'hover sull'arco
        hoveredEdge = i;
        break;
      }
    }
  }

  // DISEGNO DEGLI ARCHI
  for (let i = 0; i < edges.length; i++) {
    let n1 = nodes[edges[i].u];
    let n2 = nodes[edges[i].v];
    
    if (hoveredEdge === i) {
      stroke(96, 165, 250); // Azzurro vivace al passaggio del mouse
      strokeWeight(6);
    } else {
      stroke(180); // Grigio di default
      strokeWeight(4);
    }
    line(n1.x, n1.y, n2.x, n2.y);
  }

  // DISEGNO DEI NODI
  for (let i = 0; i < nodes.length; i++) {
    let n = nodes[i];
    
    if (hoveredNode === i) {
      fill(255);
      stroke(30); // Bordo più scuro al passaggio del mouse
      strokeWeight(4);
    } else {
      fill(255);
      stroke(100);
      strokeWeight(3);
    }
    circle(n.x, n.y, nodeRadius * 2);
  }
  
  // DISEGNO DEI TOOLTIP (Sempre in cima a tutto)
  if (hoveredNode !== -1) {
    drawTooltip(mouseX, mouseY, "NODO");
  } else if (hoveredEdge !== -1) {
    drawTooltip(mouseX, mouseY, "ARCO");
  }
}

function drawTooltip(x, y, txt) {
  push();
  fill(30, 41, 59); // Sfondo scuro slate-800
  noStroke();
  let paddingX = 12;
  let paddingY = 8;
  textSize(14);
  textStyle(BOLD);
  textFont('Inter');
  
  let tw = textWidth(txt);
  let rectW = tw + paddingX * 2;
  let rectH = 14 + paddingY * 2;
  
  // Offset per non coprire esattamente il cursore
  let offsetX = 15;
  let offsetY = -20;
  
  rect(x + offsetX, y + offsetY - rectH/2, rectW, rectH, 6); // Angoli arrotondati
  
  fill(255);
  textAlign(CENTER, CENTER);
  text(txt, x + offsetX + rectW/2, y + offsetY);
  pop();
}
