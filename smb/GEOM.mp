input centoblecent;
skalo := .9;

picture pic;
pic := image (

  pickup pencircle scaled 5;

  draw (0,50)--(50,100)--(100,50)--(50,0)--cycle;
  draw (0,50)--(100,50);
  draw (50,0)--(25,50)--(50,100);
  draw (50,0)--(75,50)--(50,100);
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.

