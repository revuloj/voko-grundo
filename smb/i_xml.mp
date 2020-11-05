input centoblecent;
skalo:=1;

% piktogramo XML / redakti

picture pic;
pic := image (

    pickup pencircle scaled 18;
    draw (-50,0)--(-90,50)--(-50,100);
    draw (50,0)--(90,50)--(50,100);
    draw (-20,0)--(20,100);

);

coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.