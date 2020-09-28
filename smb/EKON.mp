input centoblecent;
skalo := .8;


picture pic;
pic := image (
    pickup pencircle yscaled 2 xscaled 16 rotated 50;

    draw (0,0)..(20,6)..(40,3)..(80,6);
    draw (0,0){(1,3)}..(25,45)..(20,70)..(75,100)..(80,80);
    draw (5,55)--(50,55);
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
