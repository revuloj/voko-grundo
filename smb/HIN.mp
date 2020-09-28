input centoblecent;
skalo := .9;

picture pic;
pic := image (
    pickup pencircle yscaled 2 xscaled 12 rotated 140;

    draw (10,60){dir30}..(50,55)..{left}(30,35);
    draw (30,35){right}..(40,37)..(55,5)..(20,5)..{(-2,1.5)}(10,10);
    path rb;
    rb := (60.5,22)..(85,38)..(105,18)..(100,16)..(95,0);
    path tr;

    tr := (60,80){(1,-1)}..(90,60)..(105,80);

    draw (78,80)--(85,88);

    draw rb;
    draw tr;

    %for t=0 upto 7:
     % z[t]=point t of tr;
     % draw z[t] withpen pencircle scaled 2 withcolor red;
    %endfor;
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.

