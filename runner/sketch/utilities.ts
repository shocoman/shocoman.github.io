function AABBcollision(pos1: p5.Vector, size1: p5.Vector, pos2: p5.Vector, size2: p5.Vector){
    return  pos1.x + size1.x > pos2.x            &&
            pos1.y + size1.y > pos2.y            &&
            pos1.x           < pos2.x + size2.x  &&
            pos1.y           < pos2.y + size2.y  ;
}

function updateAndDrawScore() {
    score += 1;
    if (score % 1000 === 0) {
        obstacleSpeed += 1;
    }

    textSize(25);
    noStroke();
    fill(0, 200, 0);
    textFont("ComicSansMS");
    text(`Score: ${floor(score / 10)}`, 0, 25);
}