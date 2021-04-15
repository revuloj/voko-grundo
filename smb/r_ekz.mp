input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    pickup pencircle scaled 12;
    draw (-50,50)--(45,50);
    draw (21,80) -- (50,51) -- (20,20);

    % dupunkto
    pickup pencircle scaled 14;
    draw (50,80);
    draw (50,20);
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.