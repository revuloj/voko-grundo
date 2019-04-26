input centoblecent;
skalo := .8;

picture pic;
pic := image (
   % certigu grandecon de la bildo
  path koro; 
  koro := (50,0){(-1,2)}..(5,80){up}..(30,100)
   ..{(1,-2)}(50,80){(1,2)}..(70,100)..(95,80){down}..{(-1,-2)}(50,0)--cycle;
  filldraw koro;
);

show llcorner pic;
show urcorner pic;

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
