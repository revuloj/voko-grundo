input centoblecent;
skalo:=1;

picture pic;
pic := image (
    pickup pencircle scaled 1.6;

    path krani[];
    krani1 := (22,60)..(20,80){up}..tension1.2..(50,100){right}..tension1.2..(80,80){down}..(78,60);

    krani2 := (24,70)..tension1.2..(24,60)..(20,57)..tension2..(24,46)..(40,45)..(39,40)..tension2..(50,37)
    ..tension2..(61,40)..(60,45)..(76,46)..tension2..(80,57)..(76,60)..tension1.2..(76,70);

    krani3:=(34,45)..(37,46)..(35,40)..tension1.5..(40,30)
    ..tension1.5..(60,30)
    ..tension1.5..(65,40)..(63,46)..(66,45)
    ..(69,40)..tension2..(60,20)..tension2..(40,20)
    ..tension2..(31,40)..cycle;

    krani4:=(30,62)..tension1.5..(32,55)..tension1.5..(42,56)..tension1.5..(45,63)..tension1.5..(40,68)..tension1.5..cycle;

    krani5 := (50,60)..tension5..(45,45)..(48,43)..tension2..
    (50,46){curl0}..tension2..(52,43)..
    (55,45)..tension5..cycle;

    draw krani1;
    draw krani2;
    draw krani3;
    filldraw krani4;
    filldraw krani4 reflectedabout ((50,0),(50,100));
    fill krani5;

    pickup pensquare scaled 3;

    for d=0 upto 5:
      draw (40+(d*4),34+abs(2.5-d));
      draw (40+(d*4),30+abs(2.5-d));
    endfor;

    %for i=0 upto 25:
     % z[i] = point i of krani5;
     % draw z[i] withcolor red;
    %endfor;


) yscaled 1.1;

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
