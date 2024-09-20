let Body = 
{
    PX: 520,
    PY: 440,
    width: 40,
    haight: 75

};
let head =
{
    CX: 540,
    CY: 410,
    radius: 45
}
function setup()
{
	createCanvas(1024, 576);
}

function draw()
{
    noStroke();
	background(100, 155, 255); 
    fill(100, 150, 10);
    rect(0,480,1024,100);
    fill(128,128,128);
    if (key == 'd')
        {
            StayRight();
        }
        else if(key == 'a')
        {
            StayLeft();
        }
        else if(key == 'q')
        {
            JumpLeft();
        }
        else if(key == ' ')
        {
            Jump();
        }
        else if(key == 'e')
        {
            JumpRight();
        } 
        else
        {
            idle();
        }
    

}
function idle()
{
    stroke(1);
    strokeWeight(2);
    rect(Body.PX,Body.PY,Body.width,Body.haight);
    circle(head.CX,head.CY,head.radius);
    line(520,450,490,485);
    line(560,450,590,485);
    line(530,515,530,555);
    line(550,515,550,555);
    strokeWeight(4);
    point(530,410);
    point(550,410);
}

function StayRight()
{
    stroke(1);
    strokeWeight(2);
    rect(Body.PX,Body.PY,Body.width,Body.haight);
    circle(head.CX,head.CY,head.radius);
    line(540,515,540,555);
    line(540,450,540,485);
    strokeWeight(4);
    point(550,410);
}

function StayLeft()
{
    stroke(1);
    strokeWeight(2);
    rect(Body.PX,Body.PY,Body.width,Body.haight);
    circle(head.CX,head.CY,head.radius);
    line(540,515,540,555);
    line(540,450,540,485);
    strokeWeight(4);
    point(530,410);
}

function Jump()
{
    stroke(1);
    strokeWeight(2);
    rect(Body.PX,Body.PY,Body.width,Body.haight);
    circle(head.CX,head.CY,head.radius);
    line(520,450,490,485);
    line(560,450,590,485);
    line(530,515,530,535);
    line(550,515,550,535);
    line(550,535,530,515);
    line(530,535,510,515);
    strokeWeight(4);
    point(530,410);
    point(550,410);
}

function JumpRight()
{
    stroke(1);
    strokeWeight(2);
    rect(Body.PX,Body.PY,Body.width,Body.haight);
    circle(head.CX,head.CY,head.radius);
    line(540,515,540,535);
    line(540,450,540,485);
    line(540,535,510,555);
    strokeWeight(4);
    point(550,410);
}

function JumpLeft()
{
    stroke(1);
    strokeWeight(2);
    rect(Body.PX,Body.PY,Body.width,Body.haight);
    circle(head.CX,head.CY,head.radius);
    line(540,515,540,535);
    line(540,535,560,555);
    line(540,450,540,485);
    strokeWeight(4);
    point(530,410);
}