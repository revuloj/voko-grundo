input centoblecent;
skalo:=1;

picture pic;
pic := image (

    % radego    
    path radego;
    radego :=
      for i = 0 upto 17:
	   ((50,0) rotated (20*i))..
	   ((46,0) rotated (10+20*i))..
      endfor cycle;

    fill (radego -- (reverse fullcircle scaled 60) -- cycle);
    pickup pencircle scaled 10;
    draw fullcircle scaled 25;

    % rado
    pickup pencircle scaled 18;
    draw fullcircle scaled 40 shifted (-120,-18);

    % karoserio
    fill 
      (subpath (1, 2) of halfcircle 
	scaled 76 shifted (-120,-25))
      ..tension2..(-130,13)
      ..tension6..(-127,50){dir15}..{right}(-50,60)--(40,60){right}
      .. tension6.. subpath (1, 4) of halfcircle scaled 110
      --(-55,-10)--(-86,-10)..cycle;

    % stirujo/tegmento
    pickup pencircle scaled 10;
    draw (-50,60)--(-40,110)--(10,110)--(15,60);
    draw (-45,115)--(15,115);

    % fumtubo
    draw (-90,55)..tension5..(-90,90)..(-80,110);
    pickup pencircle scaled 20;
    draw (-90,70)--(-90,85);
);

coc_svg(pic,skalo);
coc_png(pic,skalo);

end.
