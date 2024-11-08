let circles = [];
let circleCount = 40;
let layersPerCircle = 8;
let particlesPerLayer = 40;
let circleRadius = 120;  // Increased circle radius
let circleSpacing = 600; // Increased spacing between circles
let layoutAngle = 7;

let pearlSize = 18;      // Increased pearl size
let vineThickness = 3;   // Increased vine thickness
let noiseScale = 3001;   // Reduced noise scale for smoother animation
let timeOffset = 100000;
let seed;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#02212f");
  seed = random(100);
  noiseSeed(seed);
  initCircles();
  loop();
}

function draw() {
  background("#055376");
  timeOffset += 0.01; // Reduced animation speed
  for (let circle of circles) {
    circle.show();
  }
}

function initCircles() {
  let angleRad = radians(layoutAngle);
  let xStep = circleSpacing * cos(angleRad);
  let yStep = circleSpacing * sin(angleRad);

  let cols = Math.ceil(width / xStep) + 1;  // Reduced number of columns
  let rows = Math.ceil(height / yStep) + 2;  // Reduced number of rows

  let startX = -circleRadius + 100;  // Adjusted starting position
  let startY = -circleRadius + 100;

  for (let row = 0; row < rows; row++) {
    let offsetX = (row % 2) * (xStep / 2);

    for (let col = 0; col < cols; col++) {
      let x = startX + col * xStep + offsetX;
      let y = startY + row * (yStep * 2.5); // Increased vertical spacing

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

    // Increased probability of white circles
    this.backgroundColor = random(0, 10) >= 5 ? color(255, 255, 255) : color(random(100, 255), random(100, 255), random(100, 255));
    this.showParticle = random(0, 10) >= 4; // Increased probability of showing particles

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
    stroke(random(150, 255), random(150, 200), random(150, 200)); // Increased color brightness
    noFill();

    beginShape();
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      let x = lerp(start.x, end.x, t);
      let y = lerp(start.y, end.y, t);

      let perpX = -(end.y - start.y) / distance;
      let perpY = (end.x - start.x) / distance;
      let amp = 5 * sin(t * PI);  // Increased wave amplitude
      let freq = 3;  // Reduced frequency for smoother curves

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

      // Enhanced pearl shine effect
      fill(255, 255, 255, 230);
      noStroke();
      ellipse(point.x - pearlSize/4, point.y - pearlSize/4, pearlSize/2.5);
    }
  }

  initConcentricCircles() {
    let numCircles = Math.ceil(random(2, 6));  // Reduced range of concentric circles
    let colors = [
      color(255, 150, 150),  // Enhanced color brightness
      color(150, 255, 150),
      color(150, 150, 255),
      color(255, 255, 150),
      color(255, 150, 255),
      color(150, 255, 255)
    ];

    for (let i = 0; i < numCircles; i++) {
      let radius = map(i, 0, numCircles - 1, this.radius * 0.9, this.radius * 0.2);
      let col = colors[i % colors.length];
      this.concentricCircles.push({
        radius: radius * 1.3,
        color: col,
        strokeWeight: map(i, 0, numCircles - 1, 5, 2)  // Increased line thickness
      });
    }
  }

  initParticles(numLayers, particlesPerLayer) {
    let layerColor = color(random(150, 255), random(150, 255), random(150, 255));  // Enhanced color brightness
    for (let layer = 0; layer < numLayers; layer++) {
      let layerRadius = (this.radius / numLayers) * (layer + 1);

      for (let i = 0; i < particlesPerLayer; i++) {
        let angle = (TWO_PI / particlesPerLayer) * i;
        let dist = layerRadius;
        let size = map(layer, 0, numLayers - 1, 5, 15) * random(0.8, 1.2);  // Increased particle size

        let px = this.x + cos(angle) * dist;
        let py = this.y + sin(angle) * dist;

        this.particles.push(new Particle(px, py, layerColor, size, angle, dist));
      }
    }
  }

  initRays() {
    let numRays = 40;  // Reduced number of rays
    let rayLength = this.radius;
    for (let i = 0; i < numRays; i++) {
      let angle = (TWO_PI / numRays) * i;
      let innerRadius = this.radius * 0.4;
      let outerRadius = innerRadius + rayLength * 0.7;
      this.rays.push({
        angle: angle,
        innerRadius: innerRadius,
        outerRadius: outerRadius,
        color: color(random(200, 255), random(150, 200), 100),  // Adjusted ray color
        noiseOffset: random(1000)
      });
    }
  }

  show() {
    this.drawBackground();

    if (!this.showParticle) {
      for (let ray of this.rays) {
        stroke(ray.color);
        strokeWeight(2.5);  // Increased ray thickness
        
        let noiseVal = noise(ray.angle * noiseScale, timeOffset + ray.noiseOffset);
        let angleOffset = map(noiseVal, 0, 1, -0.08, 0.08);  // Reduced angle offset
        let lengthOffset = map(noiseVal, 0, 1, -15, 15);  // Increased length variation
        
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
      stroke(255, 120);  // Increased stroke transparency
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
    let radiusOffset = map(noise(this.angle * noiseScale, time + this.noiseOffset + 2000), 0, 1, -8, 8);  // Increased radius variation
    let angleOffset = map(noise(this.angle * noiseScale, time + this.noiseOffset + 3000), 0, 1, -0.04, 0.04);  // Reduced angle variation
    
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