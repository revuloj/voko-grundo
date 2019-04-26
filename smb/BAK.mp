input centoblecent;
skalo := 1;

picture pic;
pic := image (
    pickup pencircle scaled 4;

    path half[];

    half1 := (0,0)--(20,25)--(43,15) ;
    half2:= (45,0)--(45,10)--(43,10)--(43,30)--(45,30)--(45,35)
            --(30,43)--(30,65)--(50,78) ;

    draw half1; draw half1 reflectedabout ((50,0),(50,100));
    draw half2; draw half2 reflectedabout ((50,0),(50,100));

    pickup pencircle scaled 3;

    draw (43,29)--(57,28);
    draw (43,24)--(57,23);
    draw (43,19)--(57,18);
    draw (43,14)--(55,13);
    draw (43,9)--(55,8);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
