input centoblecent;
skalo := 1;

picture pic;
pic := image (
    path half;

    half := (50,20){(-1,-2)}..{(-1,-2)}(25,10){curl0}..{(1,1)}(36,25){curl0}
    ..{(-1,0)}(10,40){curl0}..{(-1,1)}(12,60){curl0}..{(1,1)}(30,55){curl0}
    ..(32,50)..(42,40){curl0}
    ..(38,60)..(35,65){curl0}..(45,70)..(50,85){curl0}--cycle
    ;

    fill half shifted .2right;
    fill half reflectedabout((50,0),(50,100)) shifted .2left;
    draw (50,83)--(50,20) withpen pencircle scaled2;


    pickup pencircle xscaled1 yscaled 8 rotated20;
    draw (49.5,22)..(49.5,9)..(47,-5);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);

end.
