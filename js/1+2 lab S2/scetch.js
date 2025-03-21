let bgMusic;
let coinCollectSound;
let damageSound; 
let coinsFromEnemies = [];
let canyonFallSoundPlayed = false;
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
    jumpStrength: -12,
    moveSpeed: 5,
    facingDirection: 1,
    canMove: true,
    health: 100
};

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

let enemies = [];
let score = 0;
let gameOver = false;

function spawnEnemy() {
    let side = random([0, 1]);
    let enemy = {
        EnPosX: side == 0 ? -50 : width + 50,
        EnPosY: 432,
        EnState: side == 0 ? "enemyRight" : "enemyLeft",
        EnDirection: side == 0 ? 1 : -1,
        EnSpeed: Math.floor(Math.random() * (10 - 1)) + 1,
        isAlive: true
    };
    enemies.push(enemy);
}

function preload() {
    bgMusic = new Audio('01. Stardew Valley Overture.mp3');
    damageSound = new Audio('inecraft_death.mp3');
    coinCollectSound = new Audio('stopka-monet-30616.mp3');
    canyonFallSound = new Audio('zvuk-multyashnogo-padeniya.mp3');
}

function setup() {
    createCanvas(1024, 576);
    // Создаем элементы управления звуком
    let soundControls = createDiv('');
    soundControls.id('soundControls');
    soundControls.position(700, 10);
    
    let volumeLabel = createElement('label', 'Громкость:');
    volumeLabel.parent(soundControls);
    
    let volumeSlider = createSlider(0, 1, 1, 0.1);
    volumeSlider.id('volumeSlider');
    volumeSlider.parent(soundControls);
    
    let muteButton = createButton('Выключить звук');
    muteButton.id('muteButton');
    muteButton.parent(soundControls);
    
    // Обработчик изменения громкости
    volumeSlider.input(() => {
        let volume = volumeSlider.value();
        bgMusic.volume = volume;
        damageSound.volume = volume;
        coinCollectSound.volume = volume;
        canyonFallSound.volume = volume;
    });
    
    // Обработчик кнопки отключения звука
    muteButton.mousePressed(() => {
        if (bgMusic.volume > 0) {
            bgMusic.volume = 0;
            damageSound.volume = 0;
            coinCollectSound.volume = 0;
            canyonFallSound.volume = 0;
            volumeSlider.value(0);
            muteButton.html('Включить звук');
        } else {
            bgMusic.volume = 1;
            damageSound.volume = 1;
            coinCollectSound.volume = 1;
            canyonFallSound.volume = 1;
            volumeSlider.value(1);
            muteButton.html('Выключить звук');
        }
    });
    
}

function draw() {
    bgMusic.play();
    noStroke();
    background(100, 155, 255);

    fill(100, 150, 10);
    rect(0, 480, 1024, 100);

    drawMountain();
    drawTree(450, 450); 
    drawCanyons();

    for (let coin of coinsFromEnemies) {
        if (!coin.collected) {
            fill(255, 215, 0);
            ellipse(coin.x, coin.y, coin.radius * 2, coin.radius * 2);
        }
    }

    updateCharacter();

    if (frameCount % 120 == 0) {
        spawnEnemy();
    }

    updateAndDrawEnemies();
    checkEnemiesCollision();
    checkSwordHit();

    if (keyIsDown(68) && Characters.canMove && !gameOver) { 
        moveCharacter(Characters.moveSpeed); 
        Characters.facingDirection = 1; 
    }
    if (keyIsDown(65) && Characters.canMove && !gameOver) { 
        moveCharacter(-Characters.moveSpeed); 
        Characters.facingDirection = -1; 
    }

    fill(128, 128, 128);
    idle();

    for (let canyon of canyons) {
        checkCanyonCollision(canyon);
    }

    for (let coin of coinsFromEnemies) {
        if (!coin.collected) {
            let distance = dist(Characters.Body.PosX + Characters.Body.width / 2, Characters.Body.PosY + Characters.Body.height / 2, coin.x, coin.y);
            if (distance < 40) {
                coin.collected = true;
                score += 1;
                coinCollectSound.play();
            }
        }
    }

    fill(255);
    textAlign(LEFT);
    textSize(24);
    text("Score: " + score, 10, 30);

    fill(255, 0, 0);
    textSize(24);
    text("Health: " + Characters.health, width - 1020, 70);

    if (gameOver) {
        displayGameOver();
    }

    Characters.Eye[0].PosY = Characters.Head.CentrY; 
    Characters.Eye[1].PosY = Characters.Head.CentrY;
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
    stroke(1);
    strokeWeight(2);
    rect(Characters.Body.PosX, Characters.Body.PosY, Characters.Body.width, Characters.Body.height);
    circle(Characters.Head.CentrX, Characters.Head.CentrY, Characters.Head.radius);
    fill(0); 
    Characters.Eye.forEach(eye => {
        circle(eye.PosX, eye.PosY, eye.radius); 
    });
    
    fill(128); 
    rect(Characters.Arms.Left.PosX, Characters.Arms.Left.PosY, Characters.Arms.Left.width, Characters.Arms.Left.height);
    rect(Characters.Arms.Right.PosX, Characters.Arms.Right.PosY, Characters.Arms.Right.width, Characters.Arms.Right.height);
    
    fill(128); 
    rect(Characters.Legs.Left.PosX, Characters.Legs.Left.PosY, Characters.Legs.Left.width, Characters.Legs.Left.height);
    rect(Characters.Legs.Right.PosX, Characters.Legs.Right.PosY, Characters.Legs.Right.width, Characters.Legs.Right.height);
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

    enemies = [];
    coinsFromEnemies = [];
}

function moveCharacter(speed) {
    Characters.Body.PosX += speed; 
    Characters.Head.CentrX += speed; 
    Characters.Arms.Left.PosX += speed; 
    Characters.Arms.Right.PosX += speed; 
    Characters.Legs.Left.PosX += speed; 
    Characters.Legs.Right.PosX += speed;
    Characters.Eye[0].PosX = Characters.Head.CentrX - 10; 
    Characters.Eye[1].PosX = Characters.Head.CentrX + 10;
}

function updateAndDrawEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];

        if (enemy.isAlive) {
            enemy.EnPosX += enemy.EnSpeed * enemy.EnDirection;

            if (enemy.EnPosX < -100 || enemy.EnPosX > width + 100) {
                enemies.splice(i, 1);
                continue;
            }

            if (enemy.EnState == "enemyLeft") {
                stroke("#000000");
                strokeWeight(2);
                fill("#FFFF00");
                circle(enemy.EnPosX, enemy.EnPosY, 50);
                fill("#ffffff");
                circle(enemy.EnPosX - 10, enemy.EnPosY, 10);
            } else {
                stroke("#000000");
                strokeWeight(2);
                fill("#FFFF00");
                circle(enemy.EnPosX, enemy.EnPosY, 50);
                fill("#ffffff");
                circle(enemy.EnPosX + 10, enemy.EnPosY, 10);
            }
        }
    }
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

function checkEnemiesCollision() {
    for (let enemy of enemies) {
        if (enemy.isAlive) {
            if (Characters.Body.PosX + Characters.Body.width > enemy.EnPosX - 25 && 
                Characters.Body.PosX < enemy.EnPosX + 25 && 
                Characters.Body.PosY + Characters.Body.height > enemy.EnPosY - 25 && 
                Characters.Body.PosY < enemy.EnPosY + 25) {
                if (Characters.health > 0) {
                    Characters.health -= 50;
                    damageSound.play();
                }
            }
        }
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
    if (key == ' ') {
        if (!Characters.isJumping) { 
            Characters.isJumping = true; 
            Characters.velocityY = Characters.jumpStrength; 
        }
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

function checkSwordHit() {
    if (Characters.Sword.isStriking) {
        for (let enemy of enemies) {
            if (enemy.isAlive) {
                let swordLeft = Characters.Sword.PosX;
                let swordRight = Characters.Sword.PosX + Characters.Sword.width;
                let swordTop = Characters.Sword.PosY;
                let swordBottom = Characters.Sword.PosY + Characters.Sword.height;

                let enemyLeft = enemy.EnPosX - 25;
                let enemyRight = enemy.EnPosX + 25;
                let enemyTop = enemy.EnPosY - 25;
                let enemyBottom = enemy.EnPosY + 25;

                if (swordRight > enemyLeft && swordLeft < enemyRight &&
                    swordBottom > enemyTop && swordTop < enemyBottom) {
                    enemy.isAlive = false;
                    coinsFromEnemies.push({
                        x: enemy.EnPosX,
                        y: enemy.EnPosY,
                        radius: 12,
                        collected: false
                    });
                }
            }
        }
    }
}

function drawMountain() {
    fill(150, 150, 150);
    triangle(300, 250, 200, 480, 400, 480);
    fill(180, 180, 180);
    triangle(280, 300, 200, 480, 400, 480);
}

function drawTree(x, y) {
    fill(139, 69, 19);
    rect(x, y, 20, 40);
    fill(34, 139, 34);
    ellipse(x - 20, y - 20, 60, 60);
    ellipse(x + 30, y - 20, 60, 60);
    ellipse(x + 5, y - 50, 80, 80);
}

function drawCanyons() {
    for (let canyon of canyons) {
        fill(139, 69, 19); 
        rect(canyon.x - 20, canyon.y, 100, 96); 
        fill(0); 
        rect(canyon.x, canyon.y, canyon.width, canyon.height); 
    }
}
