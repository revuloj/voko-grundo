input centoblecent;
skalo:=.9;

picture pic;
pic := image(
    path kontur;
    kontur := (35,0)--(35,40)--(0,40)--(50,100)--(100,40)
    --(fullcircle scaled 32 shifted (50,62))
    -- (100,40) -- (65,40)--(65,0)--cycle;

    draw kontur;
    fill kontur;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
