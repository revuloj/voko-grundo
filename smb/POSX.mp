input centoblecent;
skalo:=1;

picture pic;
pic := image(
    pickup pencircle scaled 4;

    draw (0,0)--(0,60)--(100,60)--(100,0)--cycle;

    %pickup pencircle scaled .1;
    path stampo[];

    stampo1 := 
      (for i=0 upto 4:
	  (0,2i)--(1,1+2i)--
       endfor (0,10));

    stampo2 := 
      (for i=0 upto 3:
	  (2i,0)--(1+2i,-1)--
       endfor (8,0));

    fill (stampo1 -- stampo2 reflectedabout ((0,5),(5,5))
      -- reverse stampo1 reflectedabout ((4,0),(4,10))
      --  reverse stampo2 -- cycle) scaled 1.8 shifted (75,31);

    draw (20,35)--(25,35);
    draw (30,35)--(33,35);
    draw (20,25)--(43,25);
    draw (50,25)--(54,25);
    draw (20,15)--(28,15);
    draw (34,15)--(54,15);

    %draw stampo1;
    %draw stampo2;
    %draw stampo1 reflectedabout ((4,0),(4,10)); 
    %draw stampo2 reflectedabout ((0,5),(5,5));

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.

