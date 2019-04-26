input centoblecent;
skalo:=1;


picture pic;
pic := image(
    pickup pensquare scaled 5;

    draw (1,90)--(1,6)--(99,6)--(99,90);
    draw (47,5)--(53,5);

    draw (5,95){curl0}..(25,100)..{curl0}(50,95)..(75,100)..(95,95){curl0}..(95,10){curl0}..(75,15)..(50,10){curl0}..(25,15)..(5,10){curl0}..cycle;

    draw (50,95)--(50,6);

) scaled .8 rotated -12;

%clip pic to unitsquare scaled 100 shifted (5,5);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
