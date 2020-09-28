input centoblecent;
skalo:=.8;


picture pic;
pic := image (
    pickup pencircle yscaled 2 xscaled 12 rotated 40; 

    draw (20,3)--(50,100)--(80,3);


    pickup pensquare yscaled 2 xscaled 6;

    draw (15,0)--(25,0);
    draw (10,0){right}..(22,10);
    draw (25,0){left}..{(1,4)}(22,10);

    draw (75,0)--(90,0);

    draw (70,0){right}..tension1..{(-1,3)}(72,22);
    draw (90,0){left}..tension1..{(-1,3)}(77,20);
    draw (80,0)--(76,10);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
