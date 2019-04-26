input centoblecent;
skalo:=1;

picture pic;
pic := image(
  pickup pencircle scaled 6;

  draw (100,100)--(30,90)--(58,7);

  pickup pencircle scaled 2;
  filldraw ((0,0)--(-10,30)--(0,25)--(10,30)--cycle)
  rotated 18 shifted 60right;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
