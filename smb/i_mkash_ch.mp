input centoblecent;
skalo:=.8;

% piktogramo malkaŝi, t.e. angulo montranta malsupren

picture pic;
pic := image (

    pickup pencircle scaled 10;
    draw (-40,95)--(0,55)--(40,95);
    draw (-40,70)--(0,30)--(40,70);
    draw (-40,45)--(0,5)--(40,45);
    draw (0,100);
    draw (0,80);

    % evitu shovadon malsupren per nevidebla baz-linio...
    pickup pencircle scaled 0;
    draw (-50,0)--(50,0);
);

coc_svg(pic,skalo);
coc_png(pic,skalo);

end.