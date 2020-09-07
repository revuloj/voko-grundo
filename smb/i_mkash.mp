input centoblecent;
skalo:=1;

% piktogramo malkaŝi, t.e. angulo montranta malsupren

picture pic;
pic := image (

    drawoptions(withcolor .3green);

    pickup pencircle scaled 14;
    draw (0,76);
    draw (0,54);
    draw (0,32);

    pickup pencircle scaled 10;
    draw (-40,34)--(0,0)--(40,34);

    % evitu shovadon malsupren per nevidebla baz-linio...
    % pickup pencircle scaled 0;
    % draw (-50,0)--(50,0);
);

coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.