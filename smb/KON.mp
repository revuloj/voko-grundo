input centoblecent;
skalo:=.9;

picture pic;
pic := image (

    path etagho[];

    etagho1 := (0,0)--(0,21)--(50,21)--(50,0)
    --(45,0)--(45,15)--(35,15)--(35,0)
    --(30,0)--(30,15)--(20,15)--(20,0)
    --(15,0)--(15,15)--(5,15)--(5,0)--cycle;

    etagho2 := (0,0)--(0,21)--(35,21)--(35,0)
    --(30,0)--(30,15)--(20,15)--(20,0)
    --(15,0)--(15,15)--(5,15)--(5,0)--cycle;

    % domo1
    fill etagho1 shifted 20 up;
    fill etagho1 shifted 40 up;
    fill etagho1 shifted 60 up;
    fill (0,0)--(0,21)--(50,21)--(50,0)
     --(50-18,0)--(50-18,18)--(18,18)--(18,0)--cycle;
    fill (0,82)--(12,95)--(38,95)--(50,82)--cycle;
    draw(1,0)--(49,0) withpen pensquare scaled 2;

    % domo2
    fill etagho2 shifted (65,10);
    fill etagho2 shifted (65,30);
    fill etagho2 shifted (65,50);
    fill etagho2 shifted (65,70);
    fill ((0,0)--(0,11)--(35,11)--(35,0)--cycle)
      shifted 65right;
    fill ((0,92)--(17.5,100)--(35,92)--cycle)
      shifted 65 right;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
