input centoblecent;
skalo:=.9;

picture pic;
pic := image (

    pickup pencircle scaled 10;
    draw fullcircle scaled 95 shifted (50,55);
    draw (20,55) -- (80,55);
    draw (35,80) -- (65,30);
    draw (35,30) -- (65,80);
);


coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.
