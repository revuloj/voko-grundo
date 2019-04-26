input centoblecent;
skalo := .9;

% neĝero el ses radioj

picture radio;
radio := image(
    pickup pencircle scaled .12;
    draw (0,0)--(0,1);
    draw (-.3,.8)--(0,.6)--(.3,.8)
);

picture pic;
pic := image(
  for i=0 upto 5:
    draw radio scaled 50 rotated (i*60);
  endfor
);

coc_svg(pic,skalo);
% pro eraro en png-eligo de mpost 1.999 ne funkcias
% uzu rsvg-convert anstataŭe:
% coc_png(pic,saklo); 
end.
