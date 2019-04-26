input centoblecent;
skalo:=1;

picture pic;
pic := image (
path noto;
    noto := fullcircle yscaled .7 scaled 30 rotated 30;

    fill noto shifted (30-4.3,20);
    fill noto shifted (70-4.3,30);

    pickup pensquare scaled 3;
    draw (38.4,24)--(38,90);
    draw ((38.4,24)--(38,90)) shifted (40,10);

    pickup pensquare yscaled 9 ;

    draw (37,90-1) --(38+40+1,10+90-1);

    draw (37.5,90-16) --(38+40+.5,10+90-16);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.

