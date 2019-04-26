input centoblecent;
skalo:=1;


picture pic;
pic := image (

    pickup pencircle scaled 3;

    path alo;
    alo := 
      (fullcircle scaled 15 xscaled .9)
      .. (7,5)..(6.5,5.5){(1,2)}..(15,30)..(18,45);

    draw alo;

    draw alo reflectedabout ((11,0),(11,50));

   % for t=0 upto 12:
%	  z[t]=point t of alo;
	 % draw z[t] withpen pencircle scaled 2 withcolor red;
 %   endfor;


);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
