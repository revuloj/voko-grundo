input centoblecent;
skalo := .8;

picture pic;
pic := image (
    pickup pencircle scaled 4;

    path rad;
    rad := (0,20)--(0,35);

    draw fullcircle scaled 40;

    for i=0 upto 9:
      draw rad rotated (i*36);
    endfor;
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
