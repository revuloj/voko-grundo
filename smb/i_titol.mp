input centoblecent;
skalo:=.9;

picture pic;
pic := image (

    pickup pencircle scaled 10;
    draw subpath (0, 5.5) of fullcircle rotated 147 scaled 75 shifted (50,55);
    draw (30,94) -- (70,94);
    draw (50,94) -- (50,44);
);


coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.
