input centoblecent;
skalo:=.8;

picture pic;
pic := image (
  pickup pensquare yscaled 9 xscaled 12;
  draw (10,0)--(10,80)--(90,80)--(90,0)--cycle;
) shifted (5,5);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
