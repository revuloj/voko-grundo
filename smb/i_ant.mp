input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    pickup pencircle scaled 12;
    draw (-50,85) -- (15,85) -- (-35,50)--(45,50);
    draw (31,70) -- (50,51) -- (30,30);
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.