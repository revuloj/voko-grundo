input centoblecent;
skalo:=1;

picture pic;
pic := image (

    path tubo;
    tubo := (0,0){up}..(5,5)..(10,4){up}..(20,15){right}..tension10..(90,10){up}..tension2..(100,12){down}..{down}(100,-12)..tension2..{up}(90,-10)..tension10
    ..(69,-11){(-2,2)}..tension1 ..(43,-1){(-1,-.2)}..tension1..{(-1,-2)}(25,-12)..tension2..
    {(-1,-12)}(20,-14){left}..{up}(10,-4)..(5,-5)..cycle;

    fill tubo rotated 20 shifted (-54,10);

    path tenilo;
    tenilo := (10,5)--(10,13)--(22,13)--(43,36)--(44,22)--(27,5)--cycle;

    fill tenilo shifted (-70,-30);

    % rado
    pickup pencircle scaled 7;
    draw fullcircle scaled 45;
    pickup pencircle scaled 5;
    draw fullcircle scaled 12;

    path radio;
    radio := (0,6)--(0,22);

    for i:=0 upto 5:
      draw radio rotated (i*60);
    endfor;

    path kuglo;
    kuglo := fullcircle scaled 12 shifted (31,-20);

    fill kuglo;
    fill kuglo shifted 13 right;
    fill kuglo shifted (6.5,10);

    pickup pencircle scaled 2;

    %for i:=0 upto 20:
    %  z[i] = point i of (tubo rotated 20 shifted (-54,10));
     % draw z[i] withcolor red;
    %endfor;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
