input centoblecent;
skalo:=1;

picture pic;
pic := image(

    picture sat;
    sat := image(

	pickup pencircle scaled 2;

	path anteno[];
	anteno1 := fullcircle scaled 70 yscaled .4;
	anteno2 := halfcircle scaled 70 yscaled .5;

	draw anteno1;
	draw anteno2;

	z[0] = point 1.2 of anteno1;
	z[1] = point 1.2+8/3 of anteno1;
	z[2] = point 1.2+16/3 of anteno1;

	draw (0,-20)--z[0];
	draw (0,-20)--z[1];
	draw (0,-20)--z[2];

	pickup pencircle scaled 6;

	draw (0,-20)--(0,-25);

    );

    draw sat rotated 150;

    path grund;
    grund := fullcircle scaled 40 yscaled .5 shifted 50 down;
    z[3] = point .9 of grund;
    z[4] = point .9+8/3 of grund;
    z[5] = point .9+16/3 of grund;

    path tranch;
    tranch := halfcircle scaled 70 yscaled .5 rotated 150;

    path krur[];
    krur1 := (0,0)--z[3];
    krur2 := (0,0)--z[4];
    krur3 := (0,0)--z[5];

    pickup pencircle scaled 2;

    krur4 := krur1 cutbefore tranch;
    krur5 := krur2 cutbefore tranch;
    krur6 := krur3 cutbefore tranch;

    pickup pencircle scaled 3;
    draw krur4;
    draw krur5;
    draw krur6;

);

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
