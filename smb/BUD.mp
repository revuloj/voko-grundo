input centoblecent;
skalo := .9;

picture pic;
pic := image (
    fill fullcircle scaled 9 shifted (50,107);
    fill fullcircle scaled 24 yscaled 1.15 shifted (50,92);

    path body;
    body := (50,80)..(56,78)..tension5..(65,76)..(65,25)..(100,5)
    ..(95,0)..tension3..(55,0)..(50,5)
    ..(45,0)..tension3..(5,0)
    ..(0,5)..(35,25)..(35,76)..(44,78)..tension5..cycle;

    fill body;

    pickup pencircle scaled 9;
    draw (71,68)--(80,38)--(60,20);
    draw (32,68)--(25,38)--(10,10);

    %for t=0 upto 17:
    %  z[t]=point t of body;
    %  draw z[t] withpen pencircle scaled 2 withcolor red;
    %endfor;
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
