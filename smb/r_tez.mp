input centoblecent;
skalo:=1;

% piktogramo por tezaŭro (tridirekta sago)


picture pic;
pic := image (

    picture sago;
    sago := image(
        pickup pencircle scaled 10;
        draw (0,0)--(45,0);
        draw (31,15) -- (50,1) -- (30,-15);
    );

    draw sago rotated 60 shifted 50 up;
    draw sago rotated -60 shifted 50 up;
    draw sago rotated -180 shifted 50 up;

    pickup pencircle scaled 22;
    draw (0,50);
);
coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.