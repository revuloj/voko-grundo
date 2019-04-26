input centoblecent;
skalo:=.8;

picture pic;
pic := image(
   pickup pencircle yscaled 3 xscaled 16;

    draw fullcircle xscaled 80 yscaled 100 shifted (50,50);

    pickup pensquare yscaled 8 xscaled 3;

    draw (30,50)--(70,50);
    draw (30,55)--(30,45);
    draw (70,55)--(70,45);

);

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
