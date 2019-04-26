input centoblecent;
skalo:=1;

picture pic;
pic := image (

    pickup pencircle scaled 2;

    path kap;
    kap := (40,0){(-1,2)}..tension2..(32,20)..tension2..(10,22){up}
    ..(11,30){up}..(10,40)..{right}(12,41){left}
    ..(10,42)..(10,52)
    ..tension1.5..(3,55){(1,2)}..(13,70)..(16,85)
    ..(50,100){right}..{down}(80,65)..tension1.2..(65,25){down}..{(1,-2)}(75,0){left}--cycle;

    path demand[];
    demand1 := (fullcircle scaled12);

    demand2 := (0,0){(-1,4)}..(0,10)..(20,40){up}..{left}(0,60)..(-16,43){down}..(-14.5,40){down}..(-17.5,37){left}
    ..(-20,40){up}..(-20,43){up}..(0,65){right}..(30,40){down}..{down}(2,0)..cycle;

    fill kap;
    fill demand1 shifted (44,30) withcolor .8 white;
    fill demand2 scaled .8 shifted (43,38) withcolor .8 white;

    %for i=0 upto 25:
     % z[i] = point i of demand2;
     % draw z[i] withcolor red;
    %endfor;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
