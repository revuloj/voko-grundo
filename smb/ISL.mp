input centoblecent;
skalo :=1;

picture pic;
pic := image (

    phi = (0.5 * (1 + sqrt(5))) * (0.5 * (1 + sqrt(5)));
    r2 := sqrt(2)/2;

    path arko[];
    arko1 := subpath (0, 5) of fullcircle;
    arko2 := (1,0){up}..0.88*(r2,r2).. 0.75*(0,1)..0.75*(-r2,r2)..0.88*(-1,0)..(-r2,-r2);

    path luno;
    luno :=  arko1 -- (reverse arko2 scaled .5) -- cycle;

    fill luno scaled 20 shifted (-1,2);

    path line[];
    line1 := ((0,0)--(phi,0)) shifted (.82,1.12);
    line2 := ((0,0)--(-phi,0)) shifted (-.82,1.12) rotated (3*72);

    path stelo;
    stelo := line1 -- line2 -- line1 rotated -72
     -- line2 rotated -72 -- line1 rotated -144
      -- line 2 rotated -144 -- line1 rotated 144 -- line2 rotated 144 -- line1 rotated 72 -- cycle;

    fill stelo;
) rotated 110;

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.

