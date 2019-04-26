input centoblecent;
skalo:=1;

picture pic;
pic := image (
    path mright;

    mright:= (80,0) ..(60,40) ..(50,70);

    fill (0,0)..(20,40)..(30,70)..tension2..(40,90)
    ..tension2..reverse mright--cycle;

    fill (mright..tension2..(53,75)..tension2..(75,40)
    ..tension2..(100,0)--cycle) shifted 3right;
  
) yscaled .8;

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
