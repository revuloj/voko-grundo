input centoblecent;
skalo := .8;

picture pic;
pic := image (
    pickup pencircle scaled 4;

    path top;
    path bottom;
    top := (15,100)--(43,100)--(43,62)--(15,62)--cycle;
    bottom := (57,49)--(85,49){down}..tension.9..(57,0){left}--cycle;

    fill top;
    fill top reflectedabout ((50,0),(50,100));
    fill bottom;
    fill bottom reflectedabout ((50,0),(50,100));

    draw (17,48)--(17,100)--(83,100)--(83,48);
    draw (30,5.6)..(50,0)..(70,5.6);
  
) xscaled 1.2;

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
