let bgMusic;
let coinCollectSound;
let damageSound; 
let canyonFallSound;
let cannonSound;
let cameraOffsetX = 0;
let levelWidth = 2048;
let chunkSize = 512;
let lastChunkX = 0;
let isMovingLeft = false;
let isMovingRight = false;
let previousPosY;
let coinsFromEnemies = [];
let canyonFallSoundPlayed = false;
let enemies = {
    ground: [],
    air: []
};
let lastSpawnTime = 0;
let castle = {
    x: 1800,
    y: 300,
    width: 200,
    height: 180,
    cannons: [],
    lastShotTime: 0,
    shotInterval: 2000
};
let cannonBalls = [];
let backgroundMountains = [];
let backgroundTrees = [];
let clouds = [];

const INITIAL_GROUND_ENEMIES = 2;
const SPAWN_INTERVAL = 1500; 
const AIR_SPAWN_CHANCE = 0.5; 
const SPAWN_SAFE_RADIUS = 200;

let Characters = {
    Body: {
        PosX: 520,
        PosY: 440,
        width: 40,
        height: 75
    },
    Head: {
        CentrX: 540,
        CentrY: 410,
        radius: 45
    },
    Arms: {
        Left: { PosX: 505, PosY: 440, width: 10, height: 30 },
        Right: { PosX: 570, PosY: 440, width: 10, height: 30 }
    },
    Legs: {
        Left: { PosX: 520, PosY: 515, width: 10, height: 30 },
        Right: { PosX: 550, PosY: 515, width: 10, height: 30 }
    },
    Eye: [
        { PosX: 530, PosY: 410, radius: 5 }, 
        { PosX: 550, PosY: 410, radius: 5 }  
    ],
    Sword: {
        PosX: 0,
        PosY: 0,
        width: 50,
        height: 6,
        isStriking: false,
        strikeOffset: 0
    },
    isJumping: false,
    velocityY: 0,
    gravity: 0.8,
    jumpStrength: -20,
    moveSpeed: 5,
    facingDirection: 1,
    canMove: true,
    health: 100
};

let platforms = [
    {x: 300, y: 350, width: 100, height: 20, velocityX: 1},
    {x: 600, y: 250, width: 100, height: 20, velocityX: -1},
    {x: 150, y: 200, width: 80, height: 15, velocityX: 0.5}
];

let coinFromEnemy = {
    x: 0,
    y: 0,
    radius: 12,
    collected: false,
}

let canyons = [
    { x: 720, y: 480, width: 60, height: 96 },
    { x: 130, y: 480, width: 60, height: 96 }
];

let score = 0;
let gameOver = false;

function preload() {
    bgMusic = new Audio('01. Stardew Valley Overture.mp3');
    damageSound = new Audio('inecraft_death.mp3');
    coinCollectSound = new Audio('stopka-monet-30616.mp3');
    canyonFallSound = new Audio('zvuk-multyashnogo-padeniya.mp3');
    cannonSound = new Audio('zvuk-vystrela-iz-pushki-39772.mp3');
}

function setup() {
    createCanvas(1024, 576);
    generateChunk(0); 
    generateChunk(1); 
    
    castle.cannons = [
        {x: castle.x + 30, y: castle.y + 50,},
        {x: castle.x + castle.width - 30, y: castle.y + 50,}
    ];
    
    let spawned = 0;
    while(spawned < INITIAL_GROUND_ENEMIES) {
        const prevCount = enemies.ground.length;
        spawnGroundEnemy();
        if(enemies.ground.length > prevCount) spawned++;
    }
    
    generateBackground();
    
    let soundControls = createDiv('');
    soundControls.style('background', 'rgba(0,0,0,0.7)');
    soundControls.style('padding', '10px');
    soundControls.style('border-radius', '15px');
    soundControls.position(20, height - 80);
    
    let volumeLabel = createElement('span', '🔊');
    volumeLabel.parent(soundControls);
    volumeLabel.style('color', '#fff');
    volumeLabel.style('margin-right', '10px');
    
    let volumeSlider = createSlider(0, 1, 1, 0.1);
    volumeSlider.parent(soundControls);
    volumeSlider.style('width', '120px');
    volumeSlider.style('accent-color', '#4CAF50');
    volumeSlider.style('vertical-align', 'middle');
    
    let muteButton = createButton('🔈');
    muteButton.parent(soundControls);
    muteButton.style('margin-left', '10px');
    muteButton.style('border', 'none');
    muteButton.style('background', 'transparent');
    muteButton.style('color', '#fff');
    muteButton.style('cursor', 'pointer');
    muteButton.style('font-size', '20px');
    
    volumeSlider.input(() => {
        let volume = volumeSlider.value();
        bgMusic.volume = volume;
        damageSound.volume = volume;
        coinCollectSound.volume = volume;
        canyonFallSound.volume = volume;
        cannonSound.volume = volume;
    });
    
    muteButton.mousePressed(() => {
        if (bgMusic.volume > 0) {
            bgMusic.volume = 0;
            damageSound.volume = 0;
            coinCollectSound.volume = 0;
            canyonFallSound.volume = 0;
            cannonSound.volume = 0;
            volumeSlider.value(0);
        } else {
            bgMusic.volume = 1;
            damageSound.volume = 1;
            coinCollectSound.volume = 1;
            canyonFallSound.volume = 1;
            cannonSound.volume = 1;
            volumeSlider.value(1);
        }
    });
}

function generateBackground() {
    for (let i = 0; i < 3; i++) {
        backgroundMountains.push({
            x: random(-500, levelWidth + 500),
            y: 480,
            width: random(200, 400),
            height: random(100, 200),
            color: color(random(120, 150)),
            layer: floor(random(1, 4))
        });
    }
    
    for (let i = 0; i < 15; i++) {
        backgroundTrees.push({
            x: random(-500, levelWidth + 500),
            y: random(450, 480),
            size: random(0.8, 1.5),
            layer: floor(random(1, 3))
        });
    }
}

function draw() {
    bgMusic.play();
    noStroke();
    
    updateCamera();
    
    push();
    translate(-cameraOffsetX, 0);
    
    drawBackground();
    
    if ((isMovingLeft || isMovingRight) && Characters.canMove && !gameOver) {
        moveCharacter();
        Characters.facingDirection = isMovingRight ? 1 : -1;
    }

    drawCanyons();
    
    for (let coin of coinsFromEnemies) {
        if (!coin.collected) {
            fill(255, 215, 0);
            ellipse(coin.x, coin.y, coin.radius * 2);
        }
    }

    updateCharacter();
    checkEnemiesCollision();
    updatePlatforms();
    drawPlatforms();
    updateAndDrawEnemies();
    
    if (cameraOffsetX + width > castle.x - 200) {
        drawCastle();
        updateCannons();
        updateCannonBalls();
    }
    
    fill(128, 128, 128);
    idle();
    
    pop(); 
    
    drawHUD();
    generateWorld();

    for (let canyon of canyons) {
        checkCanyonCollision(canyon);
    }

    for (let i = coinsFromEnemies.length - 1; i >= 0; i--) {
        let coin = coinsFromEnemies[i];
        if (!coin.collected) {
            let distance = dist(
                Characters.Body.PosX + Characters.Body.width / 2, 
                Characters.Body.PosY + Characters.Body.height / 2, 
                coin.x, 
                coin.y
            );
            if (distance < 40) {
                coin.collected = true;
                coinsFromEnemies.splice(i, 1);
                score += 1;
                coinCollectSound.play();
            }
        }
    }
    
    Characters.Eye[0].PosY = Characters.Head.CentrY; 
    Characters.Eye[1].PosY = Characters.Head.CentrY;
}

function drawBackground() {
    let skyGradient = drawingContext.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, color(100, 155, 255));
    skyGradient.addColorStop(1, color(180, 220, 255));
    drawingContext.fillStyle = skyGradient;
    drawingContext.fillRect(0, 0, levelWidth, height);
    
    fill(255, 255, 150);
    noStroke();
    ellipse(levelWidth - 200, 100, 120, 120);
    
  
    
    for (let mountain of backgroundMountains) {
        drawMountain(mountain);
    }
    
    for (let tree of backgroundTrees) {
        drawTree(tree.x, tree.y, tree.size);
    }
    
    fill(100, 150, 10);
    rect(0, 480, levelWidth, 100);
}

function drawMountain(mountain) {
    let parallaxOffset = cameraOffsetX * (0.2 / mountain.layer);
    
    push();
    translate(-parallaxOffset, 0);
    
    fill(mountain.color);
    triangle(
        mountain.x, mountain.y - mountain.height,
        mountain.x - mountain.width/2, mountain.y,
        mountain.x + mountain.width/2, mountain.y
    );
    
    pop();
}

function drawTree(x, y, size = 1) {
    let tree = backgroundTrees.find(t => t.x === x && t.y === y);
    let parallaxOffset = tree ? cameraOffsetX * (0.3 / tree.layer) : 0;
    
    push();
    translate(-parallaxOffset, 0);
    scale(size);
    
    // Trunk
    fill(139, 69, 19);
    rect(x/size, y/size, 20/size, 40/size);
    
    // Leaves
    fill(34, 139, 34);
    ellipse(x/size - 20/size, y/size - 20/size, 60/size, 60/size);
    ellipse(x/size + 30/size, y/size - 20/size, 60/size, 60/size);
    ellipse(x/size + 5/size, y/size - 50/size, 80/size, 80/size);
    
    pop();
}

function drawClouds() {
    for (let cloud of clouds) {
        cloud.x += cloud.speed;
        if (cloud.x > levelWidth + 200) cloud.x = -200;
        
        fill(255, 255, 255, 180);
        noStroke();
        ellipse(cloud.x, cloud.y, cloud.width, cloud.height);
        ellipse(cloud.x + cloud.width/3, cloud.y - cloud.height/3, cloud.width*0.8, cloud.height*0.8);
        ellipse(cloud.x - cloud.width/3, cloud.y, cloud.width*0.7, cloud.height*0.7);
    }
}

function drawCastle() {
    // Castle base
    fill(120, 120, 120);
    rect(castle.x, castle.y + 80, castle.width, castle.height - 80);
    
    // Castle towers
    fill(100, 100, 100);
    rect(castle.x - 20, castle.y, 40, 80);
    rect(castle.x + castle.width - 20, castle.y, 40, 80);
    
    // Castle top
    fill(80, 80, 80);
    beginShape();
    vertex(castle.x, castle.y + 80);
    vertex(castle.x + castle.width/2, castle.y);
    vertex(castle.x + castle.width, castle.y + 80);
    endShape(CLOSE);
    
    // Castle windows
    fill(200, 200, 0);
    for (let i = 0; i < 3; i++) {
        rect(castle.x + 40 + i * 40, castle.y + 100, 20, 30);
    }
    
    // Draw cannons
    fill(50, 50, 50);
    for (let cannon of castle.cannons) {
        // Cannon base
        ellipse(cannon.x, cannon.y, 30, 20);
        
        // Cannon barrel
        push();
        translate(cannon.x, cannon.y);
        rotate(cannon.angle);
        rect(0, -5, 40, 10);
        pop();
    }
}

function updateCannons() {
    // Update cannon angles to aim at player
    for (let cannon of castle.cannons) {
        let dx = (Characters.Body.PosX + Characters.Body.width/2) - cannon.x;
        let dy = (Characters.Body.PosY + Characters.Body.height/2) - cannon.y;
        cannon.angle = atan2(dy, dx);
        
        // Shoot periodically
        if (millis() - castle.lastShotTime > castle.shotInterval) {
            cannonSound.play();
            let speed = 5;
            cannonBalls.push({
                x: cannon.x,
                y: cannon.y,
                dx: cos(cannon.angle) * speed,
                dy: sin(cannon.angle) * speed,
                radius: 10
            });
            castle.lastShotTime = millis();
        }
    }
}

function updateCannonBalls() {
    for (let i = cannonBalls.length - 1; i >= 0; i--) {
        let ball = cannonBalls[i];
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Draw cannon ball
        fill(0);
        ellipse(ball.x, ball.y, ball.radius * 2);
        
        // Check collision with player
        let distance = dist(
            Characters.Body.PosX + Characters.Body.width/2,
            Characters.Body.PosY + Characters.Body.height/2,
            ball.x,
            ball.y
        );
        
        if (distance < Characters.Body.width/2 + ball.radius) {
            Characters.health -= 20;
            damageSound.play();
            cannonBalls.splice(i, 1);
        }
        // Remove if out of bounds
        else if (ball.x < 0 || ball.x > levelWidth || ball.y < 0 || ball.y > height) {
            cannonBalls.splice(i, 1);
        }
    }
}

function checkCanyonCollision(canyon) {
    if (Characters.Body.PosX + Characters.Body.width > canyon.x && 
        Characters.Body.PosX < canyon.x + canyon.width && 
        Characters.Body.PosY + Characters.Body.height > canyon.y) {
        Characters.velocityY = 5; 
        Characters.Body.PosY += Characters.velocityY; 
        Characters.Head.CentrY += Characters.velocityY; 
        Characters.Legs.Left.PosY += Characters.velocityY; 
        Characters.Legs.Right.PosY += Characters.velocityY; 
        Characters.Arms.Left.PosY += Characters.velocityY; 
        Characters.Arms.Right.PosY += Characters.velocityY; 
        Characters.isJumping = false; 
        Characters.canMove = false; 
        if (!canyonFallSoundPlayed) {
            canyonFallSound.play();
            canyonFallSoundPlayed = true;
        }
    }
    
    if (Characters.Body.PosY > height) {
        Characters.health = 0; 
    }
}

function idle() {
    fill(138, 138, 148);
    rect(Characters.Body.PosX, Characters.Body.PosY, 
         Characters.Body.width, Characters.Body.height, 10);

    fill(138, 138, 148);
    rect(Characters.Arms.Left.PosX, Characters.Arms.Left.PosY, 
        Characters.Arms.Left.width, Characters.Arms.Left.height, 5);
    rect(Characters.Arms.Right.PosX, Characters.Arms.Right.PosY, 
        Characters.Arms.Right.width, Characters.Arms.Right.height, 5);
    
    fill(245, 215, 185);
    circle(Characters.Head.CentrX, Characters.Head.CentrY, 
          Characters.Head.radius);

    fill(30);
    ellipse(Characters.Eye[0].PosX, Characters.Eye[0].PosY, 
           Characters.Eye[0].radius, Characters.Eye[0].radius+2);
    ellipse(Characters.Eye[1].PosX, Characters.Eye[1].PosY, 
           Characters.Eye[1].radius, Characters.Eye[1].radius+2);
    
    fill(255);
    noStroke();
    ellipse(Characters.Eye[0].PosX-2, Characters.Eye[0].PosY-3, 3);
    ellipse(Characters.Eye[1].PosX-2, Characters.Eye[1].PosY-3, 3);
    
    fill(80, 50, 30);
    arc(Characters.Head.CentrX, Characters.Head.CentrY-5, 
       Characters.Head.radius, Characters.Head.radius, 
       PI, TWO_PI, CHORD);
    
    stroke(100);
    line(Characters.Body.PosX+10, Characters.Body.PosY+15, 
        Characters.Body.PosX+30, Characters.Body.PosY+15);
    line(Characters.Body.PosX+10, Characters.Body.PosY+25, 
        Characters.Body.PosX+30, Characters.Body.PosY+25);

    drawSword();
}

function mousePressed() {
    if (mouseButton == LEFT) {
        if (gameOver) {
            restartGame(); 
        } else {
            Characters.Sword.isStriking = true; 
            Characters.Sword.strikeOffset = 40; 
        }
    }
}

function restartGame() {
    Characters.health = 100;
    Characters.Body.PosX = 520; 
    Characters.Body.PosY = 440; 
    Characters.Head.CentrX = 540;
    Characters.Head.CentrY = 410;
    Characters.Legs.Left.PosX = 520; 
    Characters.Legs.Left.PosY = 515; 
    Characters.Legs.Right.PosX = 550; 
    Characters.Legs.Right.PosY = 515; 
    Characters.Arms.Left.PosX = 505; 
    Characters.Arms.Left.PosY = 440; 
    Characters.Arms.Right.PosX = 570; 
    Characters.Arms.Right.PosY = 440; 
    Characters.Eye[0].PosX = Characters.Head.CentrX - 10; 
    Characters.Eye[1].PosX = Characters.Head.CentrX + 10;
    score = 0; 
    gameOver = false; 
    Characters.canMove = true;
    canyonFallSoundPlayed = false; 
    cannonBalls = [];

    enemies.ground = [];
    enemies.air = [];
    coinsFromEnemies = [];
    
    let spawned = 0;
    while(spawned < INITIAL_GROUND_ENEMIES) {
        const prevCount = enemies.ground.length;
        spawnGroundEnemy();
        if(enemies.ground.length > prevCount) spawned++;
    }
}

function moveCharacter() {
    let speed = 0;
    if (isMovingLeft) speed = -Characters.moveSpeed;
    if (isMovingRight) speed = Characters.moveSpeed;
    
    Characters.Body.PosX += speed;
    Characters.Body.PosX = constrain(Characters.Body.PosX, 
        0, 
        levelWidth - Characters.Body.width
    );
    
    Characters.Head.CentrX = Characters.Body.PosX + 20;
    Characters.Arms.Left.PosX = Characters.Body.PosX - 15;
    Characters.Arms.Right.PosX = Characters.Body.PosX + Characters.Body.width;
    Characters.Legs.Left.PosX = Characters.Body.PosX;
    Characters.Legs.Right.PosX = Characters.Body.PosX + 30;
    Characters.Eye[0].PosX = Characters.Head.CentrX - 10;
    Characters.Eye[1].PosX = Characters.Head.CentrX + 10;
}

function updateCharacter() {
    if (Characters.isJumping) {
        Characters.velocityY += Characters.gravity; 
        Characters.Body.PosY += Characters.velocityY; 
        Characters.Head.CentrY += Characters.velocityY; 
        Characters.Legs.Left.PosY += Characters.velocityY; 
        Characters.Legs.Right.PosY += Characters.velocityY; 
        Characters.Arms.Left.PosY += Characters.velocityY; 
    Characters.Arms.Right.PosY += Characters.velocityY;  

        if (Characters.Body.PosY >= 440) { 
            Characters.Body.PosY = 440; 
            Characters.Head.CentrY = 410; 
            Characters.Legs.Left.PosY = 515; 
            Characters.Legs.Right.PosY = 515; 
            Characters.Arms.Left.PosY = 440; 
            Characters.Arms.Right.PosY = 440; 
            Characters.isJumping = false; 
            Characters.velocityY = 0; 
        }
    }

    const onGround = Characters.Body.PosY >= 440;
    const onPlatform = platforms.some(p => 
        Characters.Body.PosY + Characters.Body.height == p.y
    );
    
    if (Characters.Sword.isStriking) {
        Characters.Sword.strikeOffset -= 5; 
        if (Characters.Sword.strikeOffset <= 0) {
            Characters.Sword.isStriking = false; 
            Characters.Sword.strikeOffset = 0; 
        }
    }

    if (Characters.health <= 0) {
        gameOver = true;
    }
}

function displayGameOver() {
    fill(255, 0, 0);
    textSize(48);
    textAlign(CENTER);
    text("Game Over", width / 2, height / 2);
    textSize(24);
    text("Click to Restart", width / 2, height / 2 + 40);
}

function keyPressed() {
    if (keyCode == 65) { 
        isMovingLeft = true;
    } 
    if (keyCode == 68) { 
        isMovingRight = true;
    }

    if (key == ' ' && !Characters.isJumping && Characters.canMove && !gameOver) {
        Characters.isJumping = true;
        Characters.velocityY = Characters.jumpStrength;
    }
}

function keyReleased() {
    if (keyCode === 65) { 
        isMovingLeft = false;
    }
    if (keyCode === 68) { 
        isMovingRight = false;
    }
}

function drawSword() {
    fill(192, 192, 192);
    noStroke();
    
    if (Characters.facingDirection == 1) {
        Characters.Sword.PosX = Characters.Arms.Right.PosX + Characters.Arms.Right.width;
        Characters.Sword.PosY = Characters.Arms.Right.PosY + Characters.Arms.Right.height / 2;
    } else {
        Characters.Sword.PosX = Characters.Arms.Left.PosX - Characters.Sword.width;
        Characters.Sword.PosY = Characters.Arms.Left.PosY + Characters.Arms.Left.height / 2;
    }
    
    if (Characters.Sword.isStriking) {
        if (Characters.facingDirection == 1) {
            Characters.Sword.PosX += Characters.Sword.strikeOffset; 
        } else {
            Characters.Sword.PosX -= Characters.Sword.strikeOffset; 
        }
    }

    rect(Characters.Sword.PosX, Characters.Sword.PosY, Characters.Sword.width, Characters.Sword.height);
}

function drawCanyons() {
    for (let canyon of canyons) {
        if (canyon.isLava) {
            fill(255, 80, 0);
        } else {
            fill(139, 69, 19);
        }
        
        rect(canyon.x - 20, canyon.y, canyon.width + 40, canyon.height);
        fill(0);
        rect(canyon.x, canyon.y, canyon.width, canyon.height);
    }
}

function checkPlatformCollision(platform) {
    const tolerance = 5;
    const characterFeetY = Characters.Body.PosY + Characters.Body.height;
    
    if (Characters.Body.PosX + Characters.Body.width > platform.x &&
        Characters.Body.PosX < platform.x + platform.width &&
        characterFeetY >= platform.y - tolerance && 
        characterFeetY <= platform.y + tolerance ) {
        
        Characters.Body.PosY = platform.y - Characters.Body.height;
        Characters.isJumping = false;
        Characters.velocityY = 0;
        
        Characters.Body.PosX += platform.velocityX;
        updateBodyPartsPosition();
    }
    else {
        const wasOnPlatform = characterFeetY == platform.y;
        const isOutside = Characters.Body.PosX + Characters.Body.width < platform.x || 
                         Characters.Body.PosX > platform.x + platform.width;
        
        if (wasOnPlatform && isOutside) {
            Characters.isJumping = true;
            Characters.velocityY = 0;
        }
    }
}

function updateBodyPartsPosition() {
    Characters.Head.CentrX = Characters.Body.PosX + 20;
    Characters.Head.CentrY = Characters.Body.PosY - 30;
    
    Characters.Arms.Left.PosX = Characters.Body.PosX - 15;
    Characters.Arms.Left.PosY = Characters.Body.PosY; 
    Characters.Arms.Right.PosX = Characters.Body.PosX + Characters.Body.width;
    Characters.Arms.Right.PosY = Characters.Body.PosY; 
    
    Characters.Legs.Left.PosX = Characters.Body.PosX;
    Characters.Legs.Left.PosY = Characters.Body.PosY + Characters.Body.height - 15;
    Characters.Legs.Right.PosX = Characters.Body.PosX + 30;
    Characters.Legs.Right.PosY = Characters.Body.PosY + Characters.Body.height - 15;
    
    Characters.Eye[0].PosX = Characters.Head.CentrX - 10;
    Characters.Eye[1].PosX = Characters.Head.CentrX + 10;
    Characters.Eye[0].PosY = Characters.Head.CentrY;
    Characters.Eye[1].PosY = Characters.Head.CentrY;
}

function drawPlatforms() {
    for(let platform of platforms) {
        fill(109, 59, 19);
        rect(platform.x, platform.y, platform.width, 
            platform.height, 5);
        
        stroke(89, 49, 9);
        for(let i=0; i<platform.width; i+=10) {
            line(platform.x+i, platform.y+2, 
                platform.x+i, platform.y+platform.height-2);
        }
    }
}

function drawHUD() {
    drawScore();
    drawHealthBar();
    
    if (gameOver) {
        displayGameOver();
    }
}

function generateChunk(chunkIndex) {
    const chunkStartX = chunkIndex * chunkSize;
    const chunkEndX = chunkStartX + chunkSize;

    const canyonCount = 1; 
    for (let i = 0; i < canyonCount; i++) {
        let validPosition = false;
        let attempts = 0;
        let canyonX, canyonWidth;

        // Try to find valid position up to 20 attempts
        while (!validPosition && attempts < 20) {
            canyonWidth = random(60, 120);
            canyonX = chunkStartX + random(50, chunkSize - canyonWidth - 50);
            
            validPosition = true;
            
            // Check against all existing canyons
            for (const existingCanyon of canyons) {
                if (canyonX < existingCanyon.x + existingCanyon.width &&
                    canyonX + canyonWidth > existingCanyon.x) {
                    validPosition = false;
                    break;
                }
            }
            
            attempts++;
        }

        // Add canyon only if valid position found
        if (validPosition) {
            canyons.push({
                x: canyonX,
                y: 480,
                width: canyonWidth,
                height: 96,
                isLava: random() < 0.2
            });
        }
    }

    const platformCount = floor(random(1, 2)); 
    for (let i = 0; i < platformCount; i++) {
        const platformType = random() < 0.3 ? 'moving' : 'static';
        const platformWidth = random(60, 150);
        const platformX = chunkStartX + random(0, chunkSize - platformWidth);
        const platformY = random(150, 400);
        
        platforms.push({
            x: platformX,
            y: platformY,
            width: platformWidth,
            height: 15,
            velocityX: platformType === 'moving' ? random(-1.5, 1.5) : 0
        });
    }
}

function updateCamera() {
    let targetX = Characters.Body.PosX - width/2;
    cameraOffsetX = lerp(cameraOffsetX, targetX, 0.1);
    cameraOffsetX = constrain(cameraOffsetX, 0, levelWidth - width);
}

function generateWorld() {
    let currentChunk = Math.floor((cameraOffsetX + width) / chunkSize);
    if (currentChunk > lastChunkX) {
        generateChunk(currentChunk);
        lastChunkX = currentChunk;
    }
}

function drawHealthBar() {
    let barWidth = 160;
    let barHeight = 20;
    let x = 10;
    let y = 60;
    
    fill(50, 50, 50, 200);
    rect(x, y, barWidth, barHeight, 10);
    
    let healthWidth = map(Characters.health, 0, 100, 0, barWidth - 4);
    let healthColor = lerpColor(color(255, 0, 0), color(0, 255, 0), Characters.health/100);
    
    fill(healthColor);
    rect(x + 2, y + 2, healthWidth, barHeight - 4, 8);
    
    if(Characters.health < 30) {
        let pulse = map(sin(frameCount * 0.2), -1, 1, 0.5, 1);
        drawingContext.globalAlpha = pulse;
        fill(255, 50, 50, 50);
        rect(x + 2, y + 2, healthWidth, barHeight - 4, 8);
        drawingContext.globalAlpha = 1;
    }
    
    fill(255, 0, 0);
    drawingContext.shadowBlur = 10;
    textSize(20);
    text('❤', x + barWidth + 10, y + 15);
}

function drawScore() {
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
    drawingContext.shadowBlur = 8;
    drawingContext.shadowOffsetY = 4;
    
    fill(30, 144, 255);
    rect(10, 10, 160, 40, 20);
    
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(20);
    noStroke();
    text('SCORE: ' + score, 30, 30);
}

function updatePlatforms() {
    for(let platform of platforms) {
        const canyon = canyons.find(c => 
            c.x <= platform.x && 
            c.x + c.width >= platform.x + platform.width
        );
        
        if(canyon) {
            if(platform.x < canyon.x || 
               platform.x + platform.width > canyon.x + canyon.width) {
                platform.velocityX *= -1;
            }
        }
        
        platform.x += platform.velocityX;
        checkPlatformCollision(platform);
    }
}

function spawnGroundEnemy() {
    const groundY = 480 - 50;
    let attempts = 0;
    let validPosition = false;
    
    while(attempts < 10 && !validPosition) {
        const spawnX = constrain(
            cameraOffsetX + random(-100, width + 100),
            0,
            levelWidth - 40
        );

        const distanceToPlayer = dist(
            spawnX, groundY,
            Characters.Body.PosX, Characters.Body.PosY
        );
        
        if(distanceToPlayer > SPAWN_SAFE_RADIUS) {
            enemies.ground.push({
                x: spawnX,
                y: groundY - 5,
                width: 40,
                height: 50,
                speed: random(1, 3),
                direction: random() < 0.5 ? 1 : -1,
                type: 'ground'
            });
            validPosition = true;
        }
        attempts++;
    }
}

function spawnAirEnemy() {
    const startSide = random() < 0.5 ? 'left' : 'right';
    const newEnemy = {
        x: startSide === 'left' ? -50 : levelWidth + 50,
        y: random(height * 0.2, height * 0.6),
        width: 40,
        height: 30,
        speed: random(4, 6),
        direction: startSide === 'left' ? 1 : -1,
        verticalSpeed: random(-1, 1),
        type: 'air'
    };
    enemies.air.push(newEnemy);
}

function updateAndDrawEnemies() {
    for(let i = enemies.ground.length-1; i >= 0; i--) {
        const enemy = enemies.ground[i];
        enemy.x += enemy.speed * enemy.direction;
        
        if(enemy.x < 0 || enemy.x > levelWidth - enemy.width) {
            enemy.direction *= -1;
        }
        
        fill(200, 50, 50);
        rect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    for(let i = enemies.air.length-1; i >= 0; i--) {
        const enemy = enemies.air[i];
        enemy.x += enemy.speed * enemy.direction;
        enemy.y += enemy.verticalSpeed * sin(frameCount * 0.1);
        
        if(enemy.x < -100 || enemy.x > levelWidth + 100) {
            enemies.air.splice(i, 1);
            continue;
        }
        
        fill(255, 200, 0);
        beginShape();
        vertex(enemy.x, enemy.y);
        bezierVertex(
            enemy.x + 20 * enemy.direction, 
            enemy.y - 15,
            enemy.x + 40 * enemy.direction, 
            enemy.y,
            enemy.x, 
            enemy.y + 20
        );
        endShape(CLOSE);
    }
    
    if(millis() - lastSpawnTime > SPAWN_INTERVAL) {
        if(random() < AIR_SPAWN_CHANCE) spawnAirEnemy();
        spawnGroundEnemy();
        lastSpawnTime = millis();
    }
}

function checkEnemiesCollision() {
    const heroRect = {
        x: Characters.Body.PosX,
        y: Characters.Body.PosY,
        width: Characters.Body.width,
        height: Characters.Body.height
    };

    [...enemies.ground, ...enemies.air].forEach((enemy, index) => {
        const enemyRect = {
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height
        };

        if (rectIntersect(heroRect, enemyRect)) {
            Characters.health -= 30;
            damageSound.play();
        }

        if (Characters.Sword.isStriking) {
            const swordRect = {
                x: Characters.Sword.PosX,
                y: Characters.Sword.PosY,
                width: Characters.Sword.width,
                height: Characters.Sword.height
            };

            if (rectIntersect(swordRect, enemyRect)) {
                if (enemy.type === 'ground') {
                    enemies.ground.splice(index, 1);
                } else {
                    enemies.air.splice(index - enemies.ground.length, 1);
                }
                
                coinsFromEnemies.push({
                    x: enemy.x,
                    y: enemy.y,
                    radius: 12,
                    collected: false
                });
                
                score += enemy.type === 'air' ? 2 : 1;
                coinCollectSound.play();
            }
        }
    });
}

function rectIntersect(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkSwordHit() {
    if(!Characters.Sword.isStriking) return;
    
    const swordRect = {
        x: Characters.Sword.PosX,
        y: Characters.Sword.PosY,
        width: Characters.Sword.width,
        height: Characters.Sword.height
    };

    const allEnemies = [...enemies.ground, ...enemies.air];
    
    for(let i = allEnemies.length-1; i >= 0; i--) {
        const enemy = allEnemies[i];
        const enemyRect = {
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height
        };
        
        if(rectIntersect(swordRect, enemyRect)) {
            if(enemy.type === 'ground') {
                enemies.ground.splice(enemies.ground.indexOf(enemy), 1);
            } else {
                enemies.air.splice(enemies.air.indexOf(enemy), 1);
            }
            
            coinsFromEnemies.push({
                x: enemy.x,
                y: enemy.y,
                radius: 12,
                collected: false
            });
            
            score += enemy.type === 'air' ? 2 : 1;
            coinCollectSound.play();
        }
    }
}