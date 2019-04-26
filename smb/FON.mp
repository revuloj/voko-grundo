input centoblecent;
skalo:=.8;

% klarigo kiel funkcias eltondi "F" el nigra kadro, vd.
% http://tug.org/pipermail/metapost/2006-September/000647.html

picture pic;
pic := image (
    path kadro;
    kadro := (95,0)--(95,100)--(5,100)--(5,0)--cycle;

    path F;
    F := ((0,0)--(0,100)--(65,100)
    --(65,88)--(16,88)--(16,62)
    --(60,62)--(60,50)--(16,50)
    --(16,0)--cycle) scaled .75
    shifted (27,10);

    path f_en_kadro;
    f_en_kadro := kadro -- (F) -- cycle;

    picture P;
    P := image(fill kadro);
    clip P to f_en_kadro;

    draw P;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
