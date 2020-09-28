input centoblecent;
skalo :=.8;

% hebrea litero BETH
picture pic;
pic := image (
    pickup pencircle yscaled 2 xscaled 16 rotated 50;

    path beth[];
    beth1 := (1,95)..{down}(0,93)..{right}(10,90)..tension2..(60,89) 
                   ..(70,80)..tension 2..(70,20)..(65,12);
    beth2 := (0,6)--(90,6);

    draw beth1;
    draw beth2;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
