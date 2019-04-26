input centoblecent;
skalo:=.8;

picture pic;
pic := image(
  pickup pencircle scaled 10;
  draw fullcircle scaled 100 shifted (50,50);

  draw (50,15)--(50,85);
  draw (15,50)--(85,50);
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.

