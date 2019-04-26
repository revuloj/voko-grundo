input centoblecent;
skalo:=.8;

picture pic;
pic := image (
  fill (reverse fullcircle scaled 100 shifted (50,50))
  --(75,80)--(25,80)--(25,72)
  --(46,72)--(46,15)--(54,15)
  --(54,72)--(75,72)--(75,80)--cycle;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
