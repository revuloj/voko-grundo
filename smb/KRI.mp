input centoblecent;
skalo:=1;

picture pic;
pic := image (
  pickup pensquare scaled 5.5; 

  draw (42,0)--(42,60)--(12,60)--(12,73)
  --(42,73)--(42,103)--(55,103)--(55,73)
  --(85,73)--(85,60)--(55,60)--(55,0)--cycle;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
