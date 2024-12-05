let Characters = {
    Body: {
        PosX: 520,
        PosY: 440,
        width: 40,
        haight: 75
    },
    Eye: {
        RightPosX: 550,
        LeftPosX: 530,
        PosY: 410
    },
    Head: {
        CentrX: 540,
        CentrY: 410,
        radius: 45
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

    // Draw ground
    fill(100, 150, 10);
    rect(0, 480, 1024, 100);

    // Draw elements
    drawMountain();
    drawTree(130, 450);
    drawCoin(300, 500);
    drawCanyon();

    // Character and enemy drawing
    fill(128, 128, 128);
    if (keyIsPressed == false) {
        idle();
    } else {
        isPressed();
    }

    // Update and draw enemy
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
}

// Function to draw a more detailed mountain
function drawMountain() {
    fill(150, 150, 150); // Darker gray for the mountain
    triangle(300, 250, 200, 480, 400, 480); // Main mountain shape
    fill(180, 180, 180); // Another layer
    triangle(280, 300, 200, 480, 400, 480); // Additional mountain layer
}

// Function to draw a more detailed tree
function drawTree(x, y) {
    fill(139, 69, 19); // Brown color for trunk
    rect(x, y, 20, 40); // Trunk
    fill(34, 139, 34); // Green color for leaves
    ellipse(x - 20, y - 20, 60, 60); // Left foliage
    ellipse(x + 30, y - 20, 60, 60); // Right foliage
    ellipse(x + 5, y - 50, 80, 80); // Top foliage
}

// Function to draw a more detailed coin
function drawCoin(x, y) {
    fill(255, 215, 0); // Gold color
    ellipse(x, y, 24, 22); // Coin shape
    fill(255, 255, 0, 150); // Shiny effect
    ellipse(x, y, 18, 16); // Inner shiny effect
}

// Function to draw a canyon
function drawCanyon() {
    fill(139, 69, 19); // Brown color for canyon
    rect(700, 480, 100, 96); // Canyon shape
    fill(0); // Black for the inside of the canyon
    rect(720, 480, 60, 96); // Inner part of canyon
}

function isPressed() {
    if (key == 'd') {
        StayRight();
    }
    else if (key == 'a') {
        StayLeft();
    }
    else if (key == 'q') {
        JumpLeft();
    }
    else if (key == ' ') {
        Jump();
    }
    else if (key == 'e') {
        JumpRight();
    }
    else {
        idle();
    }
}

function idle() {
    stroke(1);
    strokeWeight(2);
    rect(Characters.Body.PosX, Characters.Body.PosY, Characters.Body.width, Characters.Body.haight);
    circle(Characters.Head.CentrX, Characters.Head.CentrY, Characters.Head.radius);
    line(520, 450, 490, 485);
    line(560, 450, 590, 485);
    line(530, 515, 530, 555);
    line(550, 515, 550, 555);
    strokeWeight(4);
    point(Characters.Eye.LeftPosX, Characters.Eye.PosY);
    point(Characters.Eye.RightPosX, Characters.Eye.PosY);
}

function StayRight() {
    stroke(1);
    strokeWeight(2);
    rect(Characters.Body.PosX, Characters.Body.PosY, Characters.Body.width, Characters.Body.haight);
    circle(Characters.Head.CentrX, Characters.Head.CentrY, Characters.Head.radius);
    line(540, 515, 540, 555);
    line(540, 450, 540, 485);
    strokeWeight(4);
    point(Characters.Eye.RightPosX, Characters.Eye.PosY);;
}

function StayLeft() {
    stroke(1);
    strokeWeight(2);
    rect(Characters.Body.PosX, Characters.Body.PosY, Characters.Body.width, Characters.Body.haight);
    circle(Characters.Head.CentrX, Characters.Head.CentrY, Characters.Head.radius);
    line(540, 515, 540, 555);
    line(540, 450, 540, 485);
    strokeWeight(4);
    point(Characters.Eye.LeftPosX, Characters.Eye.PosY);
}

function Jump() {
    stroke(1);
    strokeWeight(2);
    rect(Characters.Body.PosX, Characters.Body.PosY, Characters.Body.width, Characters.Body.haight);
    circle(Characters.Head.CentrX, Characters.Head.CentrY, Characters.Head.radius);
    line(520, 450, 490, 485);
    line(560, 450, 590, 485);
    line(530, 515, 530, 535);
    line(550, 515, 550, 535);
    line(550, 535, 530, 515);
    line(530, 535, 510, 515);
    strokeWeight(4);
    point(Characters.Eye.LeftPosX, Characters.Eye.PosY);
    point(Characters.Eye.RightPosX, Characters.Eye.PosY);
}

function JumpRight() {
    stroke(1);
    strokeWeight(2);
    rect(Characters.Body.PosX, Characters.Body.PosY, Characters.Body.width, Characters.Body.haight);
    circle(Characters.Head.CentrX, Characters.Head.CentrY, Characters.Head.radius);
    line(540, 515, 540, 535);
    line(540, 450, 540, 485);
    line(540, 535, 510, 555);
    strokeWeight(4);
    point(Characters.Eye.RightPosX, Characters.Eye.PosY);
}

function JumpLeft() {
    stroke(1);
    strokeWeight(2);
    rect(Characters.Body.PosX, Characters.Body.PosY, Characters.Body.width, Characters.Body.haight);
    circle(Characters.Head.CentrX, Characters.Head.CentrY, Characters.Head.radius);
    line(540, 515, 540, 535);
    line(540, 535, 560, 555);
    line(540, 450, 540, 485);
    strokeWeight(4);
    point(Characters.Eye.LeftPosX, Characters.Eye.PosY);
}