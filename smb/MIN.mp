input centoblecent;
skalo := .8;

picture pic;
pic := image(
  pickup pencircle scaled 10;
  draw fullcircle scaled 100;
  draw (0,0) withpen pencircle scaled 10;

  path guto;
  guto := (0,0){up}..(-0.16,.9)..(0,1)..(.16,.9)..{down}cycle;

  for i=0 upto 5:
    fill guto scaled 35 rotated (i*60);
  endfor;

  draw (0,0) withpen pencircle scaled 10
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
