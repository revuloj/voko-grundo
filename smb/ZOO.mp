input centoblecent;
skalo:=.9;

picture pic;
pic := image(
    pickup pencircle scaled 7;
    draw halfcircle scaled 60 shifted (50,10) reflectedabout ((0,50),(100,50));
    draw fullcircle scaled 60 shifted (50,29);
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
