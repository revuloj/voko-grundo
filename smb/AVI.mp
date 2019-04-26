input centoblecent;
skalo := 1;

picture pic;
pic := image (
    path body;

    body := (0,50){up}..(5,55){right}--(90,57){right}.. tension 1.3 ..(100,50).. tension 1.3 ..(90,43){left}--(5,45){left}..{up}cycle;

    path wing;
    wing := (45,50)--(30,100)--(40,99)--(73,50)--cycle;

    fill body; 
    fill wing;
    fill wing reflectedabout ((0,50),(100,50));

    fill wing scaled .45 shifted (-13,25);
    fill wing scaled .45 shifted (-13,25) reflectedabout ((0,50),(100,50));

) shifted 5right shifted 5up;

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
