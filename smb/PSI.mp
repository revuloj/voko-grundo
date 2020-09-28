input centoblecent;
skalo:=.8;

picture pic;
pic := image (
    pickup pencircle xscaled 12;

    draw (0,100)..(10,90)..tension2..(12,55)..tension2..(88,55)..tension2..(90,90)..(100,100);

    pickup pensquare xscaled 12;
    draw (50,100)..(50,0);

    draw (40,100){right}..{down}(50,95);
    draw (60,100){left}..{down}(50,95);
    draw (40,100)..(60,100);

    draw (40,0){right}..{up}(50,5);
    draw (60,0){left}..{up}(50,5);
    draw (40,0)..(60,0);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
