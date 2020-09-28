input centoblecent;
skalo:=1;

pickup pensquare yscaled 2 rotated -20 scaled 0.7;
picture pic;
pic := image (
  pickup pencircle scaled 7;

  draw fullcircle scaled 100;
  draw halfcircle rotated 90 shifted .6right scaled 100;
  draw halfcircle rotated -90 shifted .6left scaled 100
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
