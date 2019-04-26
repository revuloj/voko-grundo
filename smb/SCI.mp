input centoblecent;
skalo:=1;

picture pic;
pic := image(
    pickup pencircle scaled 6;

    draw fullcircle scaled 16 shifted (50,89);

    %pickup pensquare scaled 6;

    draw (50,81)--(15,0);
    draw (50,81)--(85,0);

    draw (35,40)..(65,40)..(90,55);

    pickup pensquare scaled 4;
    draw(14.1,-.9);
    draw(85.9,-.9);
    draw(91,56);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
