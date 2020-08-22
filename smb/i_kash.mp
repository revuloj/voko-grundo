input centoblecent;
skalo:=1;

% piktogramo malkaŝi, t.e. angulo montranta malsupren

picture pic;
pic := image (

    pickup pencircle scaled 12;
    draw (-50,92)--(50,92);
    draw (-40,30)--(0,70)--(40,30);

    % evitu shovadon malsupren per nevidebla baz-linio...
    % pickup pencircle scaled 0;
    % draw (-50,0)--(50,0);
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.