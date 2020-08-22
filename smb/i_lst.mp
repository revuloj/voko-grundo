input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    picture sago;
    sago := image(
        pickup pencircle scaled 12;
        draw (-50,50)--(45,50);
        draw (31,70) -- (50,51) -- (30,30);
    );

    draw sago shifted 20 up;
    draw sago shifted 20 down;
    
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.