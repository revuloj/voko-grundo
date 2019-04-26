input centoblecent;
skalo:=1;

picture pic;
pic := image (
    fill (0,50)--(50,70)--(100,50)--(50,30)--cycle;
    fill (50,28)--(80,40.5)--(80,15)
    ..(50,3){left}..(20,15)--(20,40.5)--cycle;

    path kvasto;
    draw (96,50)..(102,45)..{down}(100,38)
     withpen pencircle scaled 3;

    kvasto := (100,38){right}
    ..(104,30)..(95,15){curl0}..(96,25)..(96,35)..{right}cycle;
    fill kvasto;

   % for i=0 upto 25:
   %   z[i] = point i of kvasto;
   %   draw z[i] withcolor red;
  %  endfor;

);


coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
