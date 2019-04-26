input centoblecent;
skalo := .9;

picture pic;
pic := image (
  picture tree;
  tree := image (
      pickup pensquare scaled 5;
      %fill (50,100)--(35,40)--(65,40)--cycle;

      fill (52,30)..(35,50)..tension1.5 ..(55,100)..tension1.4 ..(65,50)..cycle;

      draw (40,0)--(60,0);
      draw (50,0)--(50,40);
    );

    draw tree;
    draw tree shifted 32 left;
    draw tree shifted 32 right;
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
  
