input centoblecent;
skalo:=1;

% piktogramo XML / redakti

picture pic;
pic := image (

   picture V;

    V := image(
        pickup pencircle scaled 12;
        draw (0,70)--(30,0)--(60,70);
    );

    draw V;
    draw V shifted 30 right;
);

coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.