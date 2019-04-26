input centoblecent;
skalo := .9;


picture pic;
pic := image (
  
    fill (20,0)--(20,10)--(27,10)--(35,71)--(65,71)
    --(73,10)--(80,10)--(80,0)--cycle;

    path tr;
    tr:= (35,75)..tension3.5..{up}(20,100){right}
    ..(40,92){right}..(50,100){right}..(60,92){right}
    ..{right}(80,100){down}..tension3.5..(65,75)--cycle;


    fill tr;
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);

end.
