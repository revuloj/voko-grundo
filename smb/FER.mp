input centoblecent;
skalo := 1.1;

picture pic;
pic := image (

    pickup pensquare scaled 3;
    draw (0,-1)--(100,-1);

    pickup pensquare scaled 4;
    draw (2,8)--(98,8);

    pickup pencircle scaled 12;

    draw (24,6);
    draw (42,6);
    draw (58,6);
    draw (76,6);

    fill (2,7)--(3,27){right}..tension5..(20,28)..tension5..{up}(22,40)
    --(78,40)..tension5..(80,28)..tension5..(97,27)--(98,7)--cycle;

    pickup pencircle scaled 2;
    draw (3.85,25){up}..tension2..(8,38)..tension2..{right}(23,39)
  --(77,39){right}..tension2..(92,38)..tension2..{down}(96.1,25);

    draw (40,40)--(25,45)--(40,50)--(55,45)--cycle;
  
);

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
