input centoblecent;
skalo:=.9;

picture pic;
pic := image (

  % folirando
  pickup pencircle scaled 20;
  draw (-80,-40) -- (-80,-100) -- (80,-100) -- (80,-30);
  draw (-80,30) -- (-80,100) -- (80,100) -- (80,50);

  % malsupra parto de ekstera okullinio
  pickup pencircle scaled 11;
  draw (-50,-20){-3,1} .. {-1,0.8}(-80,-10);
  draw (50,-20){3,1} .. {1,2}(90,10);

  % supra parto de ekstera linio
  pickup pencircle scaled 18;
  draw (-80,-6)..(5,45)..(88,15);

%  % ekstera linio dekstra duono
%  pickup pencircle scaled 8 yscaled 3 rotated -40
%  draw (50,-20){3,1} .. {1,2}(90,10){-1,1} .. {-1,0}(-8,45);

  % pupilo
  %fill (fullcircle scaled 80 -- (reverse fullcircle scaled 25 shifted (-15,15)) -- cycle);
  %pickup pencircle scaled 80;
  %draw (0,0);
  pickup pencircle scaled 1;
  fill fullcircle scaled 80 withcolor .05 white;

  %fill fullcircle scaled 32 shifted (-15,15) withcolor .10 white;
  fill fullcircle scaled 25 shifted (-15,15) withcolor white;
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
