input centoblecent;
skalo := .8;

picture pic;
pic := image (
    pickup pensquare yscaled 2 xscaled 16;

    draw (50,100)--(50,0);

    path o;
    o := (50,85)..tension .9..(90,50)..tension .9..(50,15)..tension .9..(10,50)..tension .9..cycle;
    draw o;

    draw (35,100)--(65,100);
    draw (35,0)--(65,0);

    draw (40,100){right}..{down}(50,90);
    draw (60,100){left}..{down}(50,90);

    draw (40,0){right}..{up}(50,15);
    draw (60,0){left}..{up}(50,15);

) shifted (5,5);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
