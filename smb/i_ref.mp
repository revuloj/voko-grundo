input centoblecent;
skalo:=1;

% piktogramo malkaŝi, t.e. angulo montranta malsupren

picture pic;
pic := image (

    pickup pencircle scaled 12;
    draw (-40,50)--(40,90);
    draw (-40,50)--(40,10);

    pickup pencircle scaled 27;
    draw (-40,50);
    draw (40,90);
    draw (40,10);
);

coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.