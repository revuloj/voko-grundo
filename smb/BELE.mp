input centoblecent;
skalo :=.9;

picture pic;
pic := image (
    pickup pencircle scaled 6;

    path half;
    half := (50,0)--(45,0)--(45,30)..(33,18)..(5,40)..(30,58)..(45,50){curl 0}
    ..(30,70)..(50,93){right}
    ;

    draw half;
    draw half reflectedabout ((50,0),(50,100));

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
