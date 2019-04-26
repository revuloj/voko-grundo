input centoblecent;
skalo:=.9;

picture pic;
pic := image (
    pickup pencircle scaled 10;

    draw (5,30)--(5,100)--(95,100)--(95,30)--cycle;

    fill (40,30)--(40,28)--(30,22)..(32,20)..tension5..(68,20)..(70,22)--(60,28)--(60,30)--cycle;


    pickup pencircle scaled 4;

    draw (10,16)..tension5..(0,0)..tension15..(100,0)..tension5..(90,16)..tension15..cycle;

%    pickup pensquare scaled 4;

%    for i=0 upto 15:
%      for j = 0 upto 1:
%	draw (10+i*5+j*3,5+j*5);
%      endfor;
%    endfor;

%    draw (10+16*5,5);

  pickup pensquare scaled 5;

  for i=0 upto 10:
    for j = 0 upto 1:
      draw (12+i*7+j*3,4.5+j*6); % withpen pensquare scaled 4 rotated (-20+i*3);
    endfor;
  endfor;

  draw (12+11*7,4.5); %withpen pensquare scaled 4 
       %rotated (-20+16*7);
    

);

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
