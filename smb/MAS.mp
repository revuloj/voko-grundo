input centoblecent;
skalo:=.9;

picture pic;
pic := image (
  path dentoj;

  dentoj :=
  for i = 0 upto 8:
       ((50,0) rotated (40*i)){curl0}..
       ((36,0) rotated (20+40*i))..
  endfor cycle;

  fill (dentoj -- (reverse fullcircle scaled 35) -- cycle);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
