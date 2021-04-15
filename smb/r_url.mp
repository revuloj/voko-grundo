input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    pickup pencircle scaled 11;

    draw (25,60)..(50,80)..(74,55) -- (75,27);
    draw (50,50) -- (75,25) -- (100,50);
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.