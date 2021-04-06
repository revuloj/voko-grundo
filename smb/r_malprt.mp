input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    picture sago;
    sago := image(
        pickup pencircle scaled 12;
        draw (-40,50)--(45,50);
        draw (31,70) -- (50,51) -- (30,30);
    );

    draw sago rotated 30 shifted 5 up shifted 5 left;

    % kvadrato
    pickup pencircle scaled 11;
    draw (-35,60) -- (-35,100) -- (35,100) -- (35,30) -- (-30,30);
);


coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.