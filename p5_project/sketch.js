let circles = [];
let circleCount = 40;
let layersPerCircle = 8;
let particlesPerLayer = 40;
let circleRadius = 100;
let circleSpacing = 400;
let layoutAngle = 7;

let pearlSize = 15;
let vineThickness = 4;
let noiseScale = 500;
let timeOffset = 100000;
let seed;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#02212f");
  seed = random(10000);
  noiseSeed(seed);
  initCircles();
  loop();
}

function draw() {
  background("#055376");
  timeOffset += 0.01;
  for (let circle of circles) {
    circle.show();
  }
}

function initCircles() {
  // Calculate the offset of the tilt Angle
  let angleRad = radians(layoutAngle);
  let xStep = circleSpacing * cos(angleRad);
  let yStep = circleSpacing * sin(angleRad);

  // Calculate the number of rows and columns that need to fill the entire canvas
  let cols = Math.ceil(width / xStep) + 2;
  let rows = Math.ceil(height / yStep) + 4;

  // Start at the top left corner of the canvas and offset slightly to evenly distribute the circles
  let startX = -circleRadius;
  let startY = -circleRadius;

  for (let row = 0; row < rows; row++) {
    // Even rows are offset half a distance to the right
    let offsetX = (row % 2) * (xStep / 2);

    for (let col = 0; col < cols; col++) {
      let x = startX + col * xStep + offsetX;
      let y = startY + row * (yStep * 2.3); // Reduce the vertical spacing to make the circles tighter

      // Add circles only near the visible area
      if (x >= -circleRadius && x <= width + circleRadius &&
          y >= -circleRadius && y <= height + circleRadius) {
        circles.push(new Circle(x, y, circleRadius, layersPerCircle, particlesPerLayer));
      }
    }
  }
}

class Circle {
  constructor(x, y, radius, numLayers, particlesPerLayer) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.particles = [];
    this.concentricCircles = [];
    this.rays = [];
    this.noiseOffset = random(1000);

    this.backgroundColor = random(0, 10) >= 3 ? color(255, 255, 255) : color(random(100, 255), random(100, 255), random(100, 255));
    this.showParticle = random(0, 10) >= 2;

    this.initConcentricCircles();
    this.initParticles(numLayers, particlesPerLayer);
    this.initRays();

    this.hexagonPoints = this.calculateHexagonPoints();
  }

  calculateHexagonPoints() {
    let points = [];
    for (let i = 0; i < 8; i++) {
      let angle = TWO_PI / 8 * i - PI / 8;
      let px = this.x + cos(angle) * (this.radius) * 1.2;
      let py = this.y + sin(angle) * (this.radius) * 1.2;
      points.push({x: px, y: py});
    }
    return points;
  }

  drawVineEdge(start, end) {
    let distance = dist(start.x, start.y, end.x, end.y);
    let steps = floor(distance / 10);

    push();
    strokeWeight(vineThickness);
    stroke(random(100, 255), random(100, 200), random(100, 200));
    noFill();

    beginShape();
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      let x = lerp(start.x, end.x, t);
      let y = lerp(start.y, end.y, t);

      let perpX = -(end.y - start.y) / distance;
      let perpY = (end.x - start.x) / distance;
      let amp = 4 * sin(t * PI);
      let freq = 4;

      x += perpX * amp * sin(t * TWO_PI * freq);
      y += perpY * amp * sin(t * TWO_PI * freq);

      curveVertex(x, y);
    }
    endShape();
    pop();
  }

  drawHexagonFrame() {
    for (let i = 0; i < 8; i++) {
      let start = this.hexagonPoints[i];
      let end = this.hexagonPoints[(i + 1) % 8];
      this.drawVineEdge(start, end);
    }

    for (let point of this.hexagonPoints) {
      fill(255);
      noStroke();
      ellipse(point.x, point.y, pearlSize);

      fill(255, 255, 255, 200);
      noStroke();
      ellipse(point.x - pearlSize/4, point.y - pearlSize/4, pearlSize/3);
    }
  }

  initConcentricCircles() {
    let numCircles = Math.ceil(random(1,8));
    let colors = [
      color(255, 100, 100),
      color(100, 255, 100),
      color(100, 100, 255),
      color(255, 255, 100),
      color(255, 100, 255),
      color(100, 255, 255),
      color(255, 150, 50),
      color(150, 50, 255)
    ];

    for (let i = 0; i < numCircles; i++) {
      let radius = map(i, 0, numCircles - 1, this.radius * 0.8, this.radius * 0.1);
      let col = colors[i % colors.length];
      this.concentricCircles.push({
        radius: radius * 1.3,
        color: col,
        strokeWeight: map(i, 0, numCircles - 1, 4, 1)
      });
    }
  }

  initParticles(numLayers, particlesPerLayer) {
    let layerColor = color(random(100, 255), random(100, 255), random(100, 255));
    for (let layer = 0; layer < numLayers; layer++) {
      let layerRadius = (this.radius / numLayers) * (layer + 1);

      for (let i = 0; i < particlesPerLayer; i++) {
        let angle = (TWO_PI / particlesPerLayer) * i;
        let dist = layerRadius;
        let size = map(layer, 0, numLayers - 1, 4, 12) * random(0.8, 1.2);

        let px = this.x + cos(angle) * dist;
        let py = this.y + sin(angle) * dist;

        this.particles.push(new Particle(px, py, layerColor, size, angle, dist));
      }
    }
  }

  initRays() {
    let numRays = 60;
    let rayLength = this.radius;
    for (let i = 0; i < numRays; i++) {
      let angle = (TWO_PI / numRays) * i;
      let innerRadius = this.radius * 0.4;
      let outerRadius = innerRadius + rayLength * 0.6;
      this.rays.push({
        angle: angle,
        innerRadius: innerRadius,
        outerRadius: outerRadius,
        color: color(random(200, 255), random(100, 200), 50),
        noiseOffset: random(1000)
      });
    }
  }

  show() {
    this.drawBackground();

    if (!this.showParticle) {
      for (let ray of this.rays) {
        stroke(ray.color);
        strokeWeight(2);
        
        let noiseVal = noise(ray.angle * noiseScale, timeOffset + ray.noiseOffset);
        let angleOffset = map(noiseVal, 0, 1, -0.1, 0.1);
        let lengthOffset = map(noiseVal, 0, 1, -10, 10);
        
        let adjustedAngle = ray.angle + angleOffset;
        let adjustedOuterRadius = ray.outerRadius + lengthOffset;
        
        let x1 = this.x + cos(adjustedAngle) * ray.innerRadius;
        let y1 = this.y + sin(adjustedAngle) * ray.innerRadius;
        let x2 = this.x + cos(adjustedAngle) * adjustedOuterRadius;
        let y2 = this.y + sin(adjustedAngle) * adjustedOuterRadius;
        
        line(x1, y1, x2, y2);
      }
    } else {
      for (let p of this.particles) {
        p.update(this.x, this.y, timeOffset + this.noiseOffset);
        p.show();
      }
    }

    for (let circle of this.concentricCircles) {
      fill(circle.color);
      strokeWeight(circle.strokeWeight);
      stroke(255, 100);
      ellipse(this.x, this.y, circle.radius);
    }

    this.drawHexagonFrame();
  }

  drawBackground() {
    fill(this.backgroundColor);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2.1);
  }
}

class Particle {
  constructor(x, y, col, size, angle, radius) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.col = col;
    this.size = size;
    this.angle = angle;
    this.radius = radius;
    this.noiseOffset = random(1000);
  }

  update(centerX, centerY, time) {
    let radiusOffset = map(noise(this.angle * noiseScale, time + this.noiseOffset + 2000), 0, 1, -5, 5);
    let angleOffset = map(noise(this.angle * noiseScale, time + this.noiseOffset + 3000), 0, 1, -0.05, 0.05);
    
    let adjustedRadius = this.radius + radiusOffset;
    let adjustedAngle = this.angle + angleOffset;
    
    this.x = centerX + cos(adjustedAngle) * adjustedRadius;
    this.y = centerY + sin(adjustedAngle) * adjustedRadius;
  }

  show() {
    fill(this.col);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  circles = [];
  seed = random(10000);
  noiseSeed(seed);
  initCircles();
}