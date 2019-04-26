input centoblecent;
skalo:=1;

picture pic;
pic := image (
    pickup pencircle scaled 5;

    path mitra[];
    mitra1 := (10,5){up}..(0,40)..{(1,1.5)}(36,100){(1,-1)}
    .. (80,40)..{down}(70,5){(-2,-.2)}..{left}(40,-1)..{(-2,.2)}cycle;

    mitra2:=(80,40){(1,3)}..{(-1,3.5)}(58,100){(-2.0,-1.5)}..(47,91);


    draw mitra1;
    draw mitra2;

    % bendo
    path bendo;

    bendo :=  (9,18){(2,-.2)}..(40,11){right}..{(1,.4)}(73,20);
    draw bendo;


    pickup pensquare scaled 5;

    %kruco
    draw (39,30){(-.4,5)}..(38,80);
    draw (25,60)..(52,61);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
  

