input centoblecent;
skalo:=1;

% piktogramo XML / redakti

picture pic;
pic := image (
    pickup pencircle scaled 12;
    draw (-35,0)--(-55,50)--(-35,100);
    draw (35,0)--(55,50)--(35,100);
    draw (-10,10)--(10,90);
);

coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.