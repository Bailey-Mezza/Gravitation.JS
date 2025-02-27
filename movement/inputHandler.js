
addEventListener("keydown", function(e) {
    if (e.code == 'KeyD') {
        vxr = 5;
    } if (e.code == 'KeyA') {
        vxl = -5;
    } if (e.code == 'KeyW') {
        vy = -5;
    } if (e.code == 'KeyS') {
        vy = 5;
    }
});

addEventListener("keyup", function(e) {
    if (e.code == 'KeyD') {
        vxr = 0; 
    } if (e.code == 'KeyA') {
        vxl = 0; 
    } if (e.code == 'KeyW') {
        vy = 0; 
    } if (e.code == 'KeyS') {
        vy = 0; 
    } 
});

