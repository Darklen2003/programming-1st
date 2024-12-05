let Body =
{
    PX: 520,
    PY: 440,
    width: 40,
    haight: 75

}
let head =
{
    CX: 540,
    CY: 410,
    radius: 45
}

//enemy
var EnPosX = 410;
var EnPosY = 432;
var EnSizeX = 15;
var EnSizeY = 15;
var EnState = enemyRight;
var EnDotLeft = 400;
var EnDotRight = 700;
let EnDirection = 1;
var EnRand;

function setup() {
    createCanvas(1024, 576);
}

function draw() {
    noStroke();
    background(100, 155, 255);
    fill(100, 150, 10);
    rect(0, 480, 1024, 100);
    fill(128, 128, 128);
    if (keyIsPressed == false) {
        idle();
    }
    else {
        isPressed();
    }
    EnRand = Math.floor(Math.random() * (max - min)) + min; //дает рандомное число в диапазоне от  min до max, подставь вместо них любые значения
    switch (EnState) {
        case "enemyLeft":
            enemyLeft();
            break;
        case "enemyRight":
            enemyRight();
            break;
        default:
            enemyRight();
            break;
}
function enemyMovement() {
    EnPosX += EnRand * EnDirection;
    if (EnPosX <= EnDotLeft) {
        EnPosX += EnDotLeft - EnPosX;
        EnDirection *= -1;
        EnState = "enemyRight";
    } else if (EnPosX >= EnDotRight) {
        EnPosX -= EnPosX - EnDotRight;
        EnDirection *= -1;
        EnState = "enemyLeft";
    }
}
function enemyLeft() {
    stroke("#000000");
    strokeWeight(2);
    fill("#5e29b1");
    rect(EnPosX - EnSizeX, EnPosY, EnSizeX * 2, EnSizeY * -2);
    fill("#ffffff");
    circle(EnPosX - EnSizeX, EnPosY - EnSizeY, 10); //left eye
}

function enemyRight() {
    stroke("#000000");
    strokeWeight(2);
    fill("#5e29b1");
    rect(EnPosX - EnSizeX, EnPosY, EnSizeX * 2, EnSizeY * -2);
    fill("#ffffff");
    circle(EnPosX + EnSizeX, EnPosY - EnSizeY, 10); //right eye
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
    rect(Body.PX, Body.PY, Body.width, Body.haight);
    circle(head.CX, head.CY, head.radius);
    line(520, 450, 490, 485);
    line(560, 450, 590, 485);
    line(530, 515, 530, 555);
    line(550, 515, 550, 555);
    strokeWeight(4);
    point(530, 410);
    point(550, 410);
}

function StayRight() {
    stroke(1);
    strokeWeight(2);
    rect(Body.PX, Body.PY, Body.width, Body.haight);
    circle(head.CX, head.CY, head.radius);
    line(540, 515, 540, 555);
    line(540, 450, 540, 485);
    strokeWeight(4);
    point(550, 410);
}

function StayLeft() {
    stroke(1);
    strokeWeight(2);
    rect(Body.PX, Body.PY, Body.width, Body.haight);
    circle(head.CX, head.CY, head.radius);
    line(540, 515, 540, 555);
    line(540, 450, 540, 485);
    strokeWeight(4);
    point(530, 410);
}

function Jump() {
    stroke(1);
    strokeWeight(2);
    rect(Body.PX, Body.PY, Body.width, Body.haight);
    circle(head.CX, head.CY, head.radius);
    line(520, 450, 490, 485);
    line(560, 450, 590, 485);
    line(530, 515, 530, 535);
    line(550, 515, 550, 535);
    line(550, 535, 530, 515);
    line(530, 535, 510, 515);
    strokeWeight(4);
    point(530, 410);
    point(550, 410);
}

function JumpRight() {
    stroke(1);
    strokeWeight(2);
    rect(Body.PX, Body.PY, Body.width, Body.haight);
    circle(head.CX, head.CY, head.radius);
    line(540, 515, 540, 535);
    line(540, 450, 540, 485);
    line(540, 535, 510, 555);
    strokeWeight(4);
    point(550, 410);
}

function JumpLeft() {
    stroke(1);
    strokeWeight(2);
    rect(Body.PX, Body.PY, Body.width, Body.haight);
    circle(head.CX, head.CY, head.radius);
    line(540, 515, 540, 535);
    line(540, 535, 560, 555);
    line(540, 450, 540, 485);
    strokeWeight(4);
    point(530, 410);
}
function enemyMovement() {
    EnPosX += EnRand * EnDirection; // EnPosX - позиция по X; EnRand - рандомное значение(скину ниже); EnDirection - меняет направление движения изначально равно 1
    if (EnPosX <= EnDotLeft) { //EnDotLeft - левая точка области в которой можно двигаться; Если позиция по Х меньше левой точки,
        EnPosX += EnDotLeft - EnPosX; //то EnPosX меняет направление движения и перемещается на саму позицию EnDotLeft(без этого объект  бы убегал)
        EnDirection *= -1;// Смена направления
        EnState = "enemyRight";//У меня объект меняет состояние, можно без этого
    } else if (EnPosX >= EnDotRight) {// Всё тоже самое,  но с правой стороной
        EnPosX -= EnPosX - EnDotRight;
        EnDirection *= -1;
        EnState = "enemyLeft";
    }
}