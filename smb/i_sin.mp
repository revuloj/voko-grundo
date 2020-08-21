input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    pickup pencircle scaled 12;
    draw (-50,65)--(33,65);
    draw (-50,35)--(33,35);

    draw (11,90) -- (50,51) -- (10,10);
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.