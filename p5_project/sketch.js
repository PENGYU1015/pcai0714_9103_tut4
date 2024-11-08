let circles = [];
let circleCount = 40;
let layersPerCircle = 8;
let particlesPerLayer = 40;
let circleRadius = 120;  // Increased circle radius
let circleSpacing = 600; // Increased spacing between circles
let layoutAngle = 7;

let pearlSize = 18;      // Increased pearl size
let vineThickness = 3;   // Increased vine thickness
let noiseScale = 3000;   // Reduced noise scale for smoother animation
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
    let steps = floor(distance / 8); // Increased point density for smoother curves

    push();
    strokeWeight(vineThickness);
    // Enhanced dynamic color variation
    let colorNoise = noise(start.x * 0.02, start.y * 0.02, timeOffset * 0.5);
    let r = map(colorNoise, 0, 1, 100, 255);
    let g = map(noise(start.x * 0.02, start.y * 0.02, timeOffset * 0.5 + 1000), 0, 1, 50, 200);
    let b = map(noise(start.x * 0.02, start.y * 0.02, timeOffset * 0.5 + 2000), 0, 1, 50, 200);
    stroke(r, g, b, 200); // Added slight transparency
    noFill();

    beginShape();
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      let x = lerp(start.x, end.x, t);
      let y = lerp(start.y, end.y, t);

      let perpX = -(end.y - start.y) / distance;
      let perpY = (end.x - start.x) / distance;
      
      // Intensified primary sine wave movement
      let amp = 15 * sin(t * PI);  // Significantly increased base amplitude
      let freq = 1.5;  // Further reduced frequency for wider waves
      
      // Enhanced Perlin noise movement with multiple layers
      let noiseVal1 = noise(
        t * 4 + start.x * 0.03,    // First noise layer
        t * 4 + start.y * 0.03, 
        timeOffset * 1.2           // Faster animation
      );
      
      let noiseVal2 = noise(
        t * 8 + start.x * 0.05,    // Second noise layer (higher frequency)
        t * 8 + start.y * 0.05, 
        timeOffset * 0.8
      );
      
      // Combined noise value with two layers
      let noiseVal = (noiseVal1 * 0.7 + noiseVal2 * 0.3);
      
      // More dramatic combined movement
      let combinedAmp = amp + map(noiseVal, 0, 1, -20, 20);  // Increased noise amplitude
      
      // More dynamic frequency variation
      let noiseFreq = map(
        noise(t * 6 + timeOffset * 0.8),
        0, 1,
        0.3, 2.0                   // Wider frequency variation range
      );
      
      // Primary movement with increased intensity
      x += perpX * combinedAmp * sin(t * TWO_PI * freq * noiseFreq);
      y += perpY * combinedAmp * sin(t * TWO_PI * freq * noiseFreq);

      // Enhanced perpendicular movement with two noise layers
      let perpNoise1 = map(
        noise(
          t * 7 + timeOffset * 0.9 + start.x * 0.02,
          t * 7 + timeOffset * 0.9 + start.y * 0.02
        ),
        0, 1,
        -12, 12                    // Doubled perpendicular range
      );
      
      let perpNoise2 = map(
        noise(
          t * 12 + timeOffset * 1.2 + start.x * 0.03,
          t * 12 + timeOffset * 1.2 + start.y * 0.03
        ),
        0, 1,
        -6, 6                     // Additional high-frequency movement
      );
      
      // Multiple wave motions combined
      let secondaryWave = sin(t * TWO_PI * 4 + timeOffset * 3) * 8;    // Faster, larger secondary wave
      let tertiaryWave = cos(t * TWO_PI * 2.5 + timeOffset * 2) * 6;   // Additional wave motion
      
      x += perpX * (perpNoise1 + perpNoise2 + secondaryWave + tertiaryWave);
      y += perpY * (perpNoise1 + perpNoise2 + secondaryWave + tertiaryWave);

      // Enhanced spiral effect
      let spiralAngle = t * TWO_PI * 0.8 + timeOffset * 1.5;  // Faster spiral
      let spiralRadius = 6 * (1 - t) * t;  // Larger spiral radius
      x += cos(spiralAngle) * spiralRadius;
      y += sin(spiralAngle) * spiralRadius;

      // Add chaotic movement
      let chaosAmount = 3 * noise(t * 10 + timeOffset, start.x * 0.1, start.y * 0.1);
      x += random(-chaosAmount, chaosAmount);
      y += random(-chaosAmount, chaosAmount);

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