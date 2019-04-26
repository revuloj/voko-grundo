input centoblecent;
skalo:=1.1;

picture pic;
pic := image(

    fill fullcircle scaled 16 shifted (22,58);
    fill fullcircle scaled 5 shifted (39,42);

    pickup pencircle scaled 3;
    draw (10,12)..(20,10)..tension 5..(110,42) shifted 1down;
    draw (39,42)--(80,85);
    draw (75.7,84.5)--(80,81);


    path korp;
    korp := (30,60){up}..(31,66)..tension2..(60,80){right}..(75,65){down}..
    tension2.. (60,45)--(75,30)--(63,25)--(63,27)--(68,30)
    .. tension5..(49,44)..tension3..(60,60){curl0}
    ..(40,40)--(37,43)..(48,56){curl0}
    ..tension2..cycle;

    fill korp;


   % for i=0 upto 25:
    %  z[i] = point i of korp;
      %draw z[i] withcolor red;
%    endfor;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
