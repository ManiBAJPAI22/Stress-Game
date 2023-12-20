let darkTheme = false;
let gameStarted = false;
let shooter;
let dots = [];
let bullets = [];
let bulletFrequency = 1; // Initial bullet shooting frequency
let dotSpawnFrequency = 0.5; // Initial dot spawning frequency
let timer = 0;
let gameOverFlag = false;

function setup() {
  createCanvas(512, 512);
}

function draw() {
  background(0);

  if (gameStarted) {
    // Spawn dots at regular intervals
    spawnDots();

    // Update and draw dots
    updateDots();
    drawDots();

    // Update and draw bullets
    updateBullets();
    drawBullets();

    // Update and draw shooter
    updateShooter();
    drawShooter();

    // Display timer
    fill(255);
    textSize(16);
    textAlign(RIGHT, TOP);
    text(`Time: ${timer.toFixed(2)}`, width - 10, 10);

    // Check if a dot reached the center or the shooter is hit
    if (dotReachedCenter() || shooterHit()) {
      gameOverFlag = true;
    }

    // Increment the timer if the game is not over
    if (!gameOverFlag) {
      timer += 1 / frameRate();
    }

    // Display game over message
    if (gameOverFlag) {
      gameOver();
    }
  } else {
    // Draw start screen
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Welcome to Stress Game", width / 2, height / 2 - 50);
    text("Click 'Start Game' to begin", width / 2, height / 2 + 50);
  }
}

function toggleTheme() {
  darkTheme = !darkTheme;
  updateTheme();
}

function updateTheme() {
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");

  if (darkTheme) {
    body.classList.add("dark-theme");
    themeToggle.classList.add("dark-theme");
  } else {
    body.classList.remove("dark-theme");
    themeToggle.classList.remove("dark-theme");
  }
}

function toggleGame() {
  if (!gameStarted) {
    startGame();
  } else {
    restartGame();
  }

  updateButtonText();
}

function updateButtonText() {
  const button = document.querySelector("button");
  button.innerText = gameStarted ? "Restart Game" : "Start Game";
}

function startGame() {
  // Initialize game variables and setup
  shooter = createShooter();
  dots = [];
  bullets = [];
  bulletFrequency = 1;
  dotSpawnFrequency = 0.5;
  timer = 0;
  gameOverFlag = false;
  gameStarted = true;
  loop(); // Start the game loop
}

function restartGame() {
  // Reset or reinitialize game variables
  gameStarted = false;
  noLoop(); // Stop the game loop
}

function createShooter() {
  return {
    x: width / 2,
    y: height / 2,
    size: 20,
    barrelLength: 0.25, // Length of the barrel
    angle: 0,
    bulletCooldown: 0,
  };
}

function shooterHit() {
  for (let i = 0; i < dots.length; i++) {
    const distance = dist(shooter.x, shooter.y, dots[i].x, dots[i].y);
    const minDistance = shooter.size / 2 + dots[i].size / 2;

    if (distance < minDistance) {
      return true;
    }
  }
  return false;
}

function updateShooter() {
  // Automatically rotate shooter towards the closest dot
  let closestDot;
  let closestDistance = Infinity;

  for (let i = 0; i < dots.length; i++) {
    const distance = dist(shooter.x, shooter.y, dots[i].x, dots[i].y);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestDot = dots[i];
    }
  }

  if (closestDot) {
    shooter.angle = atan2(closestDot.y - shooter.y, closestDot.x - shooter.x);
  }

  // Shoot bullets based on frequency
  if (shooter.bulletCooldown <= 0) {
    bullets.push({
      x: shooter.x + (cos(shooter.angle) * shooter.size) / 2,
      y: shooter.y + (sin(shooter.angle) * shooter.size) / 2,
      speed: 5,
      direction: shooter.angle,
      size: shooter.size / 4, // Size of the bullet is one-fourth of the shooter's size
    });
    shooter.bulletCooldown = 60 / bulletFrequency;
  } else {
    shooter.bulletCooldown--;
  }

  // Increase bullet frequency gradually
  bulletFrequency += 0.01;
}

function drawShooter() {
  // Draw shooter as a red dot
  fill(255, 0, 0); // Red color
  ellipse(shooter.x, shooter.y, shooter.size, shooter.size);

  // Draw the barrel as a line
  const barrelEndX =
    shooter.x +
    ((cos(shooter.angle) * shooter.size) / 2) * (1 + shooter.barrelLength);
  const barrelEndY =
    shooter.y +
    ((sin(shooter.angle) * shooter.size) / 2) * (1 + shooter.barrelLength);
  stroke(255, 0, 0); // Red color
  strokeWeight(2);
  line(shooter.x, shooter.y, barrelEndX, barrelEndY);
}

function updateDots() {
  // Update dots

  for (let i = dots.length - 1; i >= 0; i--) {
    const dot = dots[i];
    dot.x += cos(dot.direction) * dot.speed;
    dot.y += sin(dot.direction) * dot.speed;

    // Remove dots that are hit by bullets
    for (let j = bullets.length - 1; j >= 0; j--) {
      const bullet = bullets[j];
      const distance = dist(dot.x, dot.y, bullet.x, bullet.y);
      const minDistance = dot.size / 2 + bullet.size / 2;

      if (distance < minDistance) {
        // Remove the hit dot
        dots.splice(i, 1);

        // Remove the bullet
        bullets.splice(j, 1);
      }
    }
  }
}

function drawDots() {
  // Draw dots without a border
  noStroke(); // Set the stroke color to transparent
  fill(255); // White color
  for (let i = 0; i < dots.length; i++) {
    ellipse(dots[i].x, dots[i].y, dots[i].size, dots[i].size);
  }
}

function updateBullets() {
  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.x += cos(bullet.direction) * bullet.speed;
    bullet.y += sin(bullet.direction) * bullet.speed;

    // Remove bullets that are out of bounds
    if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
      bullets.splice(i, 1);
    }
  }
}

function drawBullets() {
  // Draw bullets
  fill(0, 0, 255); // Blue color
  for (let i = 0; i < bullets.length; i++) {
    ellipse(bullets[i].x, bullets[i].y, bullets[i].size, bullets[i].size);
  }
}

function dotReachedCenter() {
  // Check if any dot reached the center
  for (let i = 0; i < dots.length; i++) {
    if (dist(dots[i].x, dots[i].y, width / 2, height / 2) < dots[i].size / 2) {
      return true;
    }
  }
  return false;
}

function spawnDots() {
  if (frameCount % round(random(30, 60)) === 0) {
    // Spawn a random number of dots (between 2 and 25)
    const numDots = floor(random(2, 25));

    for (let i = 0; i < numDots; i++) {
      // Spawn dots from the perimeter of the circle
      const angle = random(TWO_PI);
      const radius = width / 2;
      const x = width / 2 + cos(angle) * radius;
      const y = height / 2 + sin(angle) * radius;

      dots.push({
        x,
        y,
        size: 15, // Set the size of all dots to a fixed value
        speed: 0.5, // Set the speed of all dots to a fixed value
        direction: atan2(height / 2 - y, width / 2 - x),
      });
    }
  }
}

function keyPressed() {
  // Increase bullet frequency and dot spawning frequency on spacebar press
  if (keyCode === 32) {
    bulletFrequency += 0.1;
    dotSpawnFrequency += 0.025;
  }
}

function gameOver() {
  noLoop();

  fill(0);
  textSize(90);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);

  updateButtonText(); // Update button text after game over
}

updateTheme();
updateButtonText(); // Initial button text setup
