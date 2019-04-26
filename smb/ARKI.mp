input centoblecent;
skalo := .9;

picture pic;
pic := image (
  pickup pencircle scaled 2;

  filldraw (-42,70)--(0,100)--(42,70)--cycle;

  pickup pencircle yscaled .2 scaled 8;

  path col;
  col := (0,10)--(0,63);

  draw col shifted 30left;
  draw col shifted 15left;
  draw col;
  draw col shifted 15 right;
  draw col shifted 30 right;

  pickup pencircle xscaled .2 scaled 9;

  draw (-38,0)--(38,0) yscaled 1.3

) xscaled 1.3;

coc_svg(pic,skalo);
% pro cimo en mpost-PNG 1.999 uzu rsvg-convert anstataŭe:
% coc_png(pic,skalo);

end.
