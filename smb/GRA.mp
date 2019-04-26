input centoblecent;
skalo:=.9;

% klarigo kiel funkcias eltondi "G" el nigra kadro, vd.
% http://tug.org/pipermail/metapost/2006-September/000647.html

picture pic;
pic := image (
    path kadro;
    kadro := fullcircle scaled 100 shifted(50,50);

    path G;
    G := (
      (88,82)..(50,100)..(8,50)..(50,0)..(78,18)
      --(78,5)--(90,5)--(90,60)--(60,60)--(60,50)--(75,50){down}
      ..(50,15)..(25,50)..(50,85)..(73,78)--cycle
      ) scaled .7 shifted(14,16);


    path G_en_kadro;
    G_en_kadro := kadro -- (reverse G) -- cycle;

    %draw G_en_kadro;

    picture P;
    P := image(fill kadro);
    clip P to G_en_kadro;

    draw P;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
