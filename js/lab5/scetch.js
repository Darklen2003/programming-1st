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
    isJumping: false,
    velocityY: 0,
    gravity: 0.8,
    jumpStrength: -12,
    moveSpeed: 5,
    facingDirection: 1,
    canMove: true 
};

let Canyon = {
    x: 720, 
    y: 480, 
    width: 60, 
    height: 96, 

    checkCollision: function() {
        if (Characters.Body.PosX + Characters.Body.width > this.x && 
            Characters.Body.PosX < this.x + this.width && 
            Characters.Body.PosY + Characters.Body.height > this.y) {
            Characters.velocityY = 5; 
            Characters.Body.PosY += Characters.velocityY; 
            Characters.Head.CentrY += Characters.velocityY; 
            Characters.Legs.Left.PosY += Characters.velocityY; 
            Characters.Legs.Right.PosY += Characters.velocityY; 
            Characters.Arms.Left.PosY += Characters.velocityY; 
            Characters.Arms.Right.PosY += Characters.velocityY; 
            Characters.isJumping = false; 
            Characters.canMove = false; 
        }
    }
};

let enemy = {
    EnPosX: 410,
    EnPosY: 432,
    EnState: "enemyRight",
    EnDotLeft: 0,
    EnDotRight: 300,
    EnDirection: 1,
    EnRand: 0,
    EnSpeed: Math.floor(Math.random() * (10 - 1)) + 1,

    EnemyLeft: function() {
        stroke("#000000");
        strokeWeight(2);
        fill("#FFFF00");
        circle(this.EnPosX, this.EnPosY, 50);
        fill("#ffffff");
        circle(this.EnPosX - 10, this.EnPosY, 10);
    },

    EnemyRight: function() {
        stroke("#000000");
        strokeWeight(2);
        fill("#FFFF00");
        circle(this.EnPosX, this.EnPosY, 50);
        fill("#ffffff");
        circle(this.EnPosX + 10, this.EnPosY, 10);
    },

    Movement: function() {
        this.EnPosX += this.EnSpeed * this.EnDirection;
        if (this.EnPosX <= this.EnDotLeft) {
            this.EnPosX += this.EnDotLeft - this.EnPosX;
            this.EnDirection *= -1;
            this.EnState = "enemyRight";
        } else if (this.EnPosX >= this.EnDotRight) {
            this.EnPosX -= this.EnPosX - this.EnDotRight;
            this.EnDirection *= -1;
            this.EnState = "enemyLeft";
        }
    }
};

function setup() {
    createCanvas(1024, 576);
}

function draw() {
    noStroke();
    background(100, 155, 255);

    fill(100, 150, 10);
    rect(0, 480, 1024, 100);

    drawMountain();
    drawTree(130, 450);
    drawCoin(300, 500);
    drawCanyon();

    updateCharacter();

    if (keyIsDown(68) && Characters.canMove) { 
        moveCharacter(Characters.moveSpeed); 
        Characters.facingDirection = 1; 
    }
    if (keyIsDown(65) && Characters.canMove) { 
        moveCharacter(-Characters.moveSpeed); 
        Characters.facingDirection = -1; 
    }

    fill(128, 128, 128);
    idle();

    enemy.EnSpeed = Math.floor(Math.random() * (10 - 1)) + 1;
    switch (enemy.EnState) {
        case "enemyLeft":
            enemy.EnemyLeft();
            break;
        case "enemyRight":
            enemy.EnemyRight();
            break;
        default:
            enemy.EnemyRight();
            break;
    }
    enemy.Movement();

    Canyon.checkCollision();
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
    Characters.Eye[0].PosY = Characters.Head.CentrY; 
    Characters.Eye[1].PosY = Characters.Head.CentrY;
}


function keyPressed() {
    if (key === ' ') {
        if (!Characters.isJumping) { 
            Characters.isJumping = true; 
            Characters.velocityY = Characters.jumpStrength; 
        }
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


function drawCoin(x, y) {
    fill(255, 215, 0);
    ellipse(x, y, 24, 22);
    fill(255, 255, 0, 150);
    ellipse(x, y, 18, 16);
}


function drawCanyon() {
    fill(139, 69, 19); 
    rect(700, 480, 100, 96); 
    fill(0); 
    rect(720, 480, 60, 96); 
}