input centoblecent;
skalo:=.8;

picture pic;
pic := image (

    pickup pensquare xscaled 16 yscaled 4;

    draw (0,100)--(100,100);
    draw (10,100)--(10,0);
    draw (90,100)--(90,0);
    draw (0,0)--(20,0);
    draw (80,0)--(100,0);

) xscaled .8;

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
