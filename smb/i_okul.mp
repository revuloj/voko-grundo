input centoblecent;
skalo:=.9;

picture pic;
pic := image (
  %path rando;

  %rando := (-50,-20) .. (-80,0) .. (0,55) .. (80,0) .. (50,-20) 
  %  .. (70,0) .. (0,40) .. (-70,0) .. cycle;
  %fill rando;

  % ekstera linio maldekstra duono
  pickup pencircle scaled 8 yscaled 3 rotated 40
  draw (-50,-20){-3,1} .. {-1,0.8}(-80,-10){1,1.6} .. {1,0}(5,45);

  % ekstera linio dekstra duono
  pickup pencircle scaled 8 yscaled 3 rotated -40
  draw (50,-20){3,1} .. {1,2}(90,10){-1,1} .. {-1,0}(-8,45);

  % pupilo
  fill (fullcircle scaled 80 -- (reverse fullcircle scaled 25 shifted (-15,15)) -- cycle);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
