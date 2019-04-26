input centoblecent;
skalo:=.9;


picture pic;
pic := image (
  pickup pensquare yscaled 2 rotated -20 scaled 0.7;
  draw ((1,0)--(5,10)--(9,0)--cycle) xscaled 1.4
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
