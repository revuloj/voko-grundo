input centoblecent;
skalo:=.8;


picture pic;
pic := image (
  pickup pencircle xscaled 3 yscaled 16 rotated -30;
 % sigma
  draw (92,92)--(95,100)--(0,100)
  --(50,50)--(0,0)--(95,0)--(98,10);
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
