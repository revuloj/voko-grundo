input centoblecent;
skalo := 1;

picture pic;
pic := image (
  
    pickup pencircle scaled 3;

    path lado;
    lado := (0,20)--(0,47)--(100,47)--(100,20)
      --(90,20)..(75,35)..(65,20)--(35,20)..(25,35)..(10,20)--cycle
      ;

    fill lado;
    draw (4,45){(1,2)}..(30,65){right}..(90,65){right}..{down}(98.5,53)
      --(98.5,45)
      ;

    draw (35,65)--(35,45);
    draw (56,65)--(56,45);
    draw (78,65)--(78,45);

    fill fullcircle scaled 22 shifted (22.5,22.5); 
    fill fullcircle scaled 22 shifted (77.5,22.5); 

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
