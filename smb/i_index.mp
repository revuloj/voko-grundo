input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    pickup pencircle scaled 14;
    draw (0,80);
    draw (0,50);
    draw (0,20);

    pickup pencircle scaled 12;
    draw (30,80)--(90,80);
    draw (30,50)--(90,50);
    draw (30,20)--(90,20);
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.