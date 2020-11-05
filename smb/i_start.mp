input centoblecent;
skalo:=.9;

picture pic;
pic := image (

    pickup pencircle scaled 10;
    draw subpath (0, 6) of fullcircle rotated 176 scaled 72 shifted (53,55);
    draw (19,94) -- (50,60);
    draw (18,76) -- (18,95) -- (37,94);
    %draw (30,58) -- (55,55) -- (53,80);
);


coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.
