input centoblecent;
skalo:=.9;

picture pic;
pic := image (

  % okulrando
  pickup pencircle scaled 12;
  draw (10,50){1,4} .. {1,2}(90,100);
  draw (10,50){1,-1.6} .. {1,0}(76,18);

  pickup pencircle scaled 12;
  draw (80,83) .. (90,50) .. (80,20);

  % pupilo
  pickup pencircle scaled 15;
  draw (75,20) ..(80,40) .. (80,62) .. (60,40) .. cycle;

  %draw (75,20) ..(80,30) .. (75,40) .. (60,30) .. cycle;
  pickup pencircle scaled 30;
  draw (70,30);
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
