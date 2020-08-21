input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    pickup pencircle scaled 12;
    draw (-40,65)--(40,65);
    draw (-40,35)--(40,35);

);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.