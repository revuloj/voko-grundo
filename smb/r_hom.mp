input centoblecent;
skalo:=1;

% piktogramo por sinonimo (duobla sago)

picture pic;
pic := image (

    pickup pencircle scaled 13;
    draw (-50,50)--(45,50);
    draw (21,80) -- (50,51) -- (20,20);

    % H-strekoj
    pickup pencircle scaled 12;
    draw (-50,70) -- (-50,30);
    draw (-25,70) -- (-25,30);
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.