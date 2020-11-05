input centoblecent;
skalo := .9;

picture pic;
pic := image (

  pickup pencircle scaled 5;

  draw (0,5){(1,3)}..(10,90)--(15,95)--(100,95)--(100,20)
    --(86,20)--(85,1)..{(-7,1)}cycle;

    draw (101.03,20)--(86.5,1) withpen pencircle scaled 3;

    fill (10,82)--(10,90)--(15,95)--(100,95)--(100,82)--cycle;

    draw (52,90) withpen pencircle scaled 6 withcolor white;

    pickup pencircle yscaled 4 xscaled 12;

    draw ((20,70)..(36,80)..(49,65)..{left}(36,55){right}
    ..(50,40)..(36,20)..(19,25)) rotated -4 shifted (-3,-3);

    draw ((53,65){(2,1)}..{(1,2)}(70,80)--(70,21)) rotated -2 shifted (11,-5);
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.

