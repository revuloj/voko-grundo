input centoblecent;
skalo:=.8;

picture pic;
pic := image(
    pickup pensquare scaled 5;
    
    for i=0 upto 4:
      for j= 0 upto 4:
	draw (20i,20j)--(5+20i,20j);
     endfor;
    endfor;

    for i=0 upto 3:
      for j= 0 upto 3:
	draw (10+20i,10+20j)--(15+20i,10+20j);
     endfor;
    endfor;

    for i=0 upto 4:
      for j= 0 upto 3:
	draw (2.5+20i,7.5+20j)--(2.5+20i,12.5+20j);
     endfor;
    endfor;

    for i=0 upto 3:
      for j= 0 upto 4:
	draw (12.5+20i,-2.5+20j)--(12.5+20i,2.5+20j);
     endfor;
    endfor;

) rotated 30 scaled 2 shifted (28,-28);

clip pic to unitsquare scaled 100 shifted (5,5);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
