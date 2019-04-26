input centoblecent;
skalo:=1;

picture pic;
pic := image (
    pickup pencircle scaled 4;

    draw (0,20)--(20,80)--(80,80)--(100,20);
    draw (40,20)--(20,80);
    draw (80,80)--(60,20);

    pickup pencircle scaled 6;
    draw (50,100)--(50,80);
    draw (20,80)--(80,80);

    path ujo;
    ujo := (halfcircle--cycle) rotated 180 yscaled .7 scaled 45;

    fill ujo shifted (20,20);
    fill ujo shifted (80,20);
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
