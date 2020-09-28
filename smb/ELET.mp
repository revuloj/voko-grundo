input centoblecent;
skalo := .9;

picture pic;
pic := image (
  pickup pencircle xscaled 7;

draw (50,100)--(50,50);

    pickup pencircle yscaled 6;

    draw (0,50)--(100,50);
    draw (12,38)--(88,38);

    draw (24,26)--(76,26);
    draw (36,14)--(64,14);

    draw (47.5,2)--(52.5,2);
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
