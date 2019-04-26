input centoblecent;
skalo:=.9;

picture pic;
pic := image (
    pickup pencircle scaled 8;

    draw fullcircle scaled 18 shifted (50,90);
    draw (50,80)--(50,0);
    draw (10,30)..(50,0)..(90,30);

    pickup pensquare scaled 12 rotated -25;
    draw (0,0) shifted (9,32);
    pickup pensquare scaled 12 rotated 25;
    draw (0,0) shifted (91,32);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
