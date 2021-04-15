input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    picture sago;
    sago := image(
        pickup pencircle scaled 13;
        draw (-30,50)--(45,50);
        draw (31,70) -- (50,51) -- (30,30);
    );

    % kvadrateto 35x35 
    picture kv;
    kv := image(
        pickup pencircle scaled 11;
        draw (85,30) -- (105,30) -- (105,-5) -- (70,-5) -- (70,5);
    );

    draw sago rotated -30;
    draw kv shifted 5 down;
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.