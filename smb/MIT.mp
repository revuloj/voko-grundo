input centoblecent;
skalo := .8;
  
picture pic;
pic := image(
  pickup pencircle scaled 10;
  draw fullcircle scaled 100;
  %fill fullcircle scaled 20
  draw (0,0) withpen pencircle scaled 20;
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
