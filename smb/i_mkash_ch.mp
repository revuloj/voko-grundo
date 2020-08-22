input centoblecent;
skalo:=1;

% piktogramo malkaŝi, t.e. angulo montranta malsupren

picture pic;
pic := image (

    pickup pencircle scaled 10;
    %draw (-40,85)--(0,51)--(40,85);
    draw (-40,60)--(0,26)--(40,60);
    draw (-40,35)--(0,1)--(40,35);
    pickup pencircle scaled 14;
    draw (0,90);
    draw (0,68);

    % evitu shovadon malsupren per nevidebla baz-linio...
    % pickup pencircle scaled 0;
    % draw (-50,0)--(50,0);
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);

end.