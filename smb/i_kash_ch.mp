input centoblecent;
skalo:=1;

% piktogramo malkaŝi, t.e. angulo montranta malsupren

picture pic;
pic := image (

    %drawoptions(withcolor .3green);

    pickup pencircle scaled 12;
    draw (-50,100)--(50,100);
    %draw (-50,82)--(50,82);
    %draw (-50,64)--(50,64);
    draw (-50,76)--(50,76);
    
    draw (-40,10)--(0,50)--(40,10);

    % evitu shovadon malsupren per nevidebla baz-linio...
    % pickup pencircle scaled 0;
    % draw (-50,0)--(50,0);
);

coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.