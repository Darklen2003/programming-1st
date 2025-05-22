let bgMusic;
let coinCollectSound;
let damageSound; 
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

const INITIAL_GROUND_ENEMIES = 2;
const SPAWN_INTERVAL = 1500; // Уменьшили интервал спавна с 2000 до 1500 мс
const AIR_SPAWN_CHANCE = 0.5; // Увеличили шанс спавна воздушных врагов с 0.3 до 0.5
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
}

function setup() {
    createCanvas(1024, 576);
    generateChunk(0); // Генерация первого чанка
    generateChunk(1); // Генерация второго чанка
        let spawned = 0;
    while(spawned < INITIAL_GROUND_ENEMIES) {
        const prevCount = enemies.ground.length;
        spawnGroundEnemy();
        if(enemies.ground.length > prevCount) spawned++;
    }
    let soundControls = createDiv('');
    soundControls.id('soundControls');
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
        } else {
            bgMusic.volume = 1;
            damageSound.volume = 1;
            coinCollectSound.volume = 1;
            canyonFallSound.volume = 1;
            volumeSlider.value(1);
        }
    });
    
}

function draw() {
    bgMusic.play();
    noStroke();
    
    // Обновляем позицию камеры
    updateCamera();
    
    // Начинаем смещение камеры
    push();
    translate(-cameraOffsetX, 0);
    
    // Отрисовка фона с учетом камеры
    background(100, 155, 255);
    fill(100, 150, 10);
    rect(0, 480, levelWidth, 100);

    if ((isMovingLeft || isMovingRight) && Characters.canMove && !gameOver) {
    moveCharacter();
    Characters.facingDirection = isMovingRight ? 1 : -1;
}

    drawMountain();
    drawTree(450, 450); 
    drawCanyons();

    // Отрисовка игровых объектов
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

    // Отрисовка персонажа
    fill(128, 128, 128);
    idle();
    
    pop(); // Конец смещения камеры
    
    // Отрисовка HUD поверх всего
    drawHUD();
    
    // Генерация новых участков
    generateWorld();
    
    // Оригинальные проверки коллизий
    for (let canyon of canyons) {
        checkCanyonCollision(canyon);
    }

    // Оригинальная логика сбора монет
    for (let coin of coinsFromEnemies) {
        if (!coin.collected) {
            let distance = dist(
                Characters.Body.PosX + Characters.Body.width / 2, 
                Characters.Body.PosY + Characters.Body.height / 2, 
                coin.x, 
                coin.y
            );
            if (distance < 40) {
                coin.collected = true;
                score += 1;
                coinCollectSound.play();
            }
        }
    }

    // Оригинальное обновление глаз
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
    // Тень под персонажем
    drawingContext.shadowColor = 'rgba(0,0,0,0.4)';
    drawingContext.shadowBlur = 16;
    drawingContext.shadowOffsetY = 8;
    
    // Улучшенное тело
    fill(138, 138, 148);
    rect(Characters.Body.PosX, Characters.Body.PosY, 
         Characters.Body.width, Characters.Body.height, 10);

            // Руки 
    fill(138, 138, 148);
    rect(Characters.Arms.Left.PosX, Characters.Arms.Left.PosY, 
        Characters.Arms.Left.width, Characters.Arms.Left.height, 5);
    rect(Characters.Arms.Right.PosX, Characters.Arms.Right.PosY, 
        Characters.Arms.Right.width, Characters.Arms.Right.height, 5);
    
    // Голова с деталями
    fill(245, 215, 185);
    circle(Characters.Head.CentrX, Characters.Head.CentrY, 
          Characters.Head.radius);
    
    // Детализированные глаза
    fill(30);
    ellipse(Characters.Eye[0].PosX, Characters.Eye[0].PosY, 
           Characters.Eye[0].radius, Characters.Eye[0].radius+2);
    ellipse(Characters.Eye[1].PosX, Characters.Eye[1].PosY, 
           Characters.Eye[1].radius, Characters.Eye[1].radius+2);
    
    // Блики в глазах
    fill(255);
    noStroke();
    ellipse(Characters.Eye[0].PosX-2, Characters.Eye[0].PosY-3, 3);
    ellipse(Characters.Eye[1].PosX-2, Characters.Eye[1].PosY-3, 3);
    
    // Волосы
    fill(80, 50, 30);
    arc(Characters.Head.CentrX, Characters.Head.CentrY-5, 
       Characters.Head.radius, Characters.Head.radius, 
       PI, TWO_PI, CHORD);
    
    // Детали брони
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
    
    // Обновляем части тела
    Characters.Head.CentrX = Characters.Body.PosX + 20;
    Characters.Arms.Left.PosX = Characters.Body.PosX - 15;
    Characters.Arms.Right.PosX = Characters.Body.PosX + Characters.Body.width;
    Characters.Legs.Left.PosX = Characters.Body.PosX;
    Characters.Legs.Right.PosX = Characters.Body.PosX + 30;
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

    const onGround = Characters.Body.PosY >= 440;
    const onPlatform = platforms.some(p => 
        Characters.Body.PosY + Characters.Body.height === p.y
    );
    
    // Автоматическое падение если не на поверхности
    if (!onGround && !onPlatform && !Characters.isJumping) {
        Characters.isJumping = true;
        Characters.velocityY = 0;
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
    if (keyCode === 65) { // A
        isMovingLeft = true;
    } 
    if (keyCode === 68) { // D
        isMovingRight = true;
    }

    if (key == ' ' && !Characters.isJumping && Characters.canMove && !gameOver) {
        Characters.isJumping = true;
        Characters.velocityY = Characters.jumpStrength;
        
        // Проверка нахождения на платформе для усиленного прыжка
        let onPlatform = platforms.some(platform => 
            Characters.Body.PosY + Characters.Body.height === platform.y
        );
        
        if (onPlatform) Characters.velocityY *= 1.2;
    }
}

function keyReleased() {
    if (keyCode === 65) { // A
        isMovingLeft = false;
    }
    if (keyCode === 68) { // D
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
        // Меняем цвет для лавы
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

function updatePlatforms() {
    for(let platform of platforms) {
        // Движение платформы
        platform.x += platform.velocityX;
        
        // Изменение направления при достижении границ
        if(platform.x < 50 || platform.x + platform.width > width - 50) {
            platform.velocityX *= -1;
        }
        
        // Обновление коллизий
        checkPlatformCollision(platform);
    }
}

function checkPlatformCollision(platform) {
    const tolerance = 5;
    const characterFeetY = Characters.Body.PosY + Characters.Body.height;
    
    // Проверяем коллизию с платформой
    if (Characters.Body.PosX + Characters.Body.width > platform.x &&
        Characters.Body.PosX < platform.x + platform.width &&
        characterFeetY >= platform.y - tolerance && 
        characterFeetY <= platform.y + tolerance ) {
        
        // Фиксация на платформе
        Characters.Body.PosY = platform.y - Characters.Body.height;
        Characters.isJumping = false;
        Characters.velocityY = 0;
        
        // Движение вместе с платформой
        Characters.Body.PosX += platform.velocityX;
        updateBodyPartsPosition();
    }
    else {
        // Проверка на выход за пределы платформы
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
    // Обновляем позиции всех частей тела относительно основного положения
    Characters.Head.CentrX = Characters.Body.PosX + 20;
    Characters.Head.CentrY = Characters.Body.PosY - 30;
    
    // Руки
    Characters.Arms.Left.PosX = Characters.Body.PosX - 15;
    Characters.Arms.Left.PosY = Characters.Body.PosY; // Добавляем обновление Y-координаты
    Characters.Arms.Right.PosX = Characters.Body.PosX + Characters.Body.width;
    Characters.Arms.Right.PosY = Characters.Body.PosY; // Добавляем обновление Y-координаты
    
    // Ноги
    Characters.Legs.Left.PosX = Characters.Body.PosX;
    Characters.Legs.Left.PosY = Characters.Body.PosY + Characters.Body.height - 15;
    Characters.Legs.Right.PosX = Characters.Body.PosX + 30;
    Characters.Legs.Right.PosY = Characters.Body.PosY + Characters.Body.height - 15;
    
    // Глаза
    Characters.Eye[0].PosX = Characters.Head.CentrX - 10;
    Characters.Eye[1].PosX = Characters.Head.CentrX + 10;
    Characters.Eye[0].PosY = Characters.Head.CentrY;
    Characters.Eye[1].PosY = Characters.Head.CentrY;
}

function drawPlatforms() {
    // Платформы с текстурой
    for(let platform of platforms) {
        fill(109, 59, 19);
        rect(platform.x, platform.y, platform.width, 
            platform.height, 5);
        
        // Текстура дерева
        stroke(89, 49, 9);
        for(let i=0; i<platform.width; i+=10) {
            line(platform.x+i, platform.y+2, 
                platform.x+i, platform.y+platform.height-2);
        }
        
        // Тень
        drawingContext.shadowColor = 'rgba(0,0,0,0.3)';
        drawingContext.shadowBlur = 10;
        drawingContext.shadowOffsetY = 5;
    }
}

// Новая функция отрисовки HUD
function drawHUD() {
    // Счет
    drawScore();
    
    // Здоровье под счетом
    drawHealthBar();
    
    if (gameOver) {
        displayGameOver();
    }
}

function generateChunk(chunkIndex) {
    let baseX = chunkIndex * chunkSize;
    
    // Генерация каньонов с платформами
    if (random() < 0.3) {
        const canyonCount = floor(random(1, 3));
        for (let i = 0; i < canyonCount; i++) {
            // Создаем каньон
            const canyonWidth = random(60, 120);
            const canyonX = baseX + random(50, chunkSize - 100);
            const newCanyon = {
                x: canyonX,
                y: 480,
                width: canyonWidth,
                height: 96,
                isLava: random() < 0.2
            };
            canyons.push(newCanyon);
            
            // Создаем платформу над каньоном
            const platformWidth = canyonWidth * 0.8; // Ширина 80% от каньона
            platforms.push({
                x: canyonX + (canyonWidth - platformWidth)/2, // Центрируем над каньоном
                y: 380, // Высота над каньоном
                width: platformWidth,
                height: 15,
                velocityX: random(-1, 1) // Случайное движение влево/вправо
            });
        }
    }
    
    // Удаляем старую генерацию платформ
}

// Новая функция для обновления камеры
function updateCamera() {
    let targetX = Characters.Body.PosX - width/2;
    cameraOffsetX = lerp(cameraOffsetX, targetX, 0.1);
    cameraOffsetX = constrain(cameraOffsetX, 0, levelWidth - width);
}

// Новая функция генерации мира
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
    
    // Фон полосы
    fill(50, 50, 50, 200);
    rect(x, y, barWidth, barHeight, 10);
    
    // Здоровье
    let healthWidth = map(Characters.health, 0, 100, 0, barWidth - 4);
    let healthColor = lerpColor(color(255, 0, 0), color(0, 255, 0), Characters.health/100);
    
    fill(healthColor);
    rect(x + 2, y + 2, healthWidth, barHeight - 4, 8);
    
    // Анимация пульсации при низком здоровье
    if(Characters.health < 30) {
        let pulse = map(sin(frameCount * 0.2), -1, 1, 0.5, 1);
        drawingContext.globalAlpha = pulse;
        fill(255, 50, 50, 50);
        rect(x + 2, y + 2, healthWidth, barHeight - 4, 8);
        drawingContext.globalAlpha = 1;
    }
    
    // Иконка сердца
    fill(255, 0, 0);
    drawingContext.shadowColor = 'rgba(255,0,0,0.5)';
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
        // Движение платформы только в пределах каньона
        const canyon = canyons.find(c => 
            c.x <= platform.x && 
            c.x + c.width >= platform.x + platform.width
        );
        
        if(canyon) {
            // Ограничиваем движение в пределах каньона
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
    const groundY = 480 - 50; // Позиция на земле
    let attempts = 0;
    let validPosition = false;
    
    // Делаем до 10 попыток найти валидную позицию
    while(attempts < 10 && !validPosition) {
        const spawnX = cameraOffsetX + random(width * 0.2, width * 0.8);
        
        // Проверяем расстояние до игрока
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
// Функция спавна воздушных врагов
function spawnAirEnemy() {
    const startSide = random() < 0.5 ? 'left' : 'right';
    const newEnemy = {
        x: startSide === 'left' ? cameraOffsetX - 50 : cameraOffsetX + width + 50,
        y: random(height * 0.2, height * 0.6),
        width: 40,
        height: 30,
        speed: random(4, 6), // Увеличили скорость
        direction: startSide === 'left' ? 1 : -1,
        verticalSpeed: random(-1, 1), // Увеличили вертикальную скорость
        type: 'air'
    };
    enemies.air.push(newEnemy);
}

function updateAndDrawEnemies() {
    // Обновление наземных врагов
    for(let i = enemies.ground.length-1; i >= 0; i--) {
        const enemy = enemies.ground[i];
        enemy.x += enemy.speed * enemy.direction;
        if(enemy.x < cameraOffsetX || enemy.x > cameraOffsetX + width) {
            enemy.direction *= -1;
        }
        fill(200, 50, 50);
        rect(enemy.x - cameraOffsetX, enemy.y, enemy.width, enemy.height);
    }

    // Обновление воздушных врагов
    for(let i = enemies.air.length-1; i >= 0; i--) {
        const enemy = enemies.air[i];
        enemy.x += enemy.speed * enemy.direction;
        enemy.y += enemy.verticalSpeed * sin(frameCount * 0.1);
        fill(255, 200, 0);
        beginShape();
        vertex(enemy.x - cameraOffsetX, enemy.y);
        bezierVertex(
            enemy.x - cameraOffsetX + 20 * enemy.direction, 
            enemy.y - 15,
            enemy.x - cameraOffsetX + 40 * enemy.direction, 
            enemy.y,
            enemy.x - cameraOffsetX, 
            enemy.y + 20
        );
        endShape(CLOSE);
    }
    
    // Спавн только воздушных врагов
    if(millis() - lastSpawnTime > SPAWN_INTERVAL) {
        spawnAirEnemy();
        if(random() < 0.2) spawnAirEnemy();
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

    // Проверка всех врагов
    [...enemies.ground, ...enemies.air].forEach((enemy, index) => {
        const enemyRect = {
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height
        };

        // Проверка столкновения с игроком
        if (rectIntersect(heroRect, enemyRect)) {
            Characters.health -= 30;
            damageSound.play();
            
            // УБРАН КОД ОТБРАСЫВАНИЯ:
            // Characters.velocityY = -10;
            // Characters.Body.PosX += enemy.direction * 20;
        }

        // Проверка удара мечом
        if (Characters.Sword.isStriking) {
            const swordRect = {
                x: Characters.Sword.PosX + cameraOffsetX,
                y: Characters.Sword.PosY,
                width: Characters.Sword.width,
                height: Characters.Sword.height
            };

            if (rectIntersect(swordRect, enemyRect)) {
                // Удаление врага
                if (enemy.type === 'ground') {
                    enemies.ground.splice(index, 1);
                } else {
                    enemies.air.splice(index - enemies.ground.length, 1);
                }
                
                // Создание монеты
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
    
    // Получаем реальные координаты меча с учетом камеры
    const swordRect = {
        x: Characters.Sword.PosX + cameraOffsetX,
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
            // Удаление врага и создание монеты
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

function spawnAirEnemy() {
    const startSide = random() < 0.5 ? 'left' : 'right';
    const newEnemy = {
        x: startSide === 'left' ? cameraOffsetX - 50 : cameraOffsetX + width + 50,
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