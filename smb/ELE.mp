input centoblecent;
skalo := 1.1;

picture pic;
pic := image (
  path fulm;

  fulm := (0,0)--(50,50)--(60,50)--(80,100)
  --(62,48)--(52,48)--(3,0)--cycle;

  fill fulm rotated -5;
  fill fulm rotated -20;
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
