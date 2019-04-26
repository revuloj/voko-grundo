input centoblecent;
skalo :=1;

picture pic;
pic := image (
    pickup pencircle scaled 5;

    draw fullcircle scaled 33 shifted 50right shifted 50up;

    pickup pensquare scaled 5;
    draw (50,33)--(50,0);
    draw (35,16)--(65,16);

    pickup pensquare scaled 3;
    draw (63,63)--(85,85);

    pickup pensquare scaled 4;
    draw (72,85)--(85,85)--(85,72);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
