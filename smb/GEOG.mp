input centoblecent;
skalo:=1;

picture pic;
pic := image (
  %suno

    picture suno;
    suno := image(
        pickup pencircle scaled 4;

	path rad;
	rad := (0,20)--(0,35);

	draw fullcircle scaled 40;

	for i=0 upto 9:
	  draw rad rotated (i*36);
	endfor;
    ) shifted(50,50);

    picture montoj;
    montoj := image(

        path mright;
	path monto[];
	pickup pencircle scaled 4;
	
	mright:= (80,0) ..(60,40) ..(50,70);

	monto1 := (0,0)..(20,40)..(30,70)..tension2..(40,90)..tension2
	  ..reverse mright--cycle;
	fill monto1 withcolor .65white;

	monto2 := (mright..tension2..(53,75)..tension2..(75,40)
	    ..tension2..(100,0)--cycle);
	fill monto2 withcolor .35 white;

	draw monto1; draw monto2;

    ) yscaled .5;

    draw suno ;
    draw montoj;
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);

end.
