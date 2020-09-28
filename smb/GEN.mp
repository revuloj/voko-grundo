input centoblecent;
skalo:=1;

picture pic;
pic := image (

    path head;
    head := (17,17)..(17,60)..(40,70)..(53,66)..(59,52)..tension5
    ..(64,38){(-1,-.3)}..(57,37){curl0}..tension2..
    (58,20)
    ..(47,18)..(49,9)..(44,4)..(34,0)..(17,17)--cycle;

    path hair;
    hair := (24,20)..(11,22)..(0,50)..(20,75)
    ..tension1.2 ..(61,60)..(44,62)..(32,48)..(24,37)..cycle;

    picture contur;

    contur := image(
      pickup pencircle scaled 2;

      draw (10,0)..(17,17);

      draw (58,30)..(53,31);

      draw (53,56)--(42,50)--(52,46);
      draw (50,50.5) withpen pencircle scaled 4;

      draw head;

    );

    fill head shifted 25 right withcolor .7 white;
    draw contur shifted 25 right;
    fill hair shifted 25 right withcolor .2 white;

    fill head withcolor .8white;
    draw contur;
    fill hair;
    %for t=0 upto 20:
    %  z[t]=point t of hair;
    %  draw z[t] withpen pencircle scaled 2 withcolor red;
    %endfor;
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
