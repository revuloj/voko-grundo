input centoblecent;
skalo := 1;

picture pic;
pic := image (
  
    picture lorno;
    lorno := image(
      pickup pencircle xscaled .2 scaled 12;
      draw (-10,0)--(20,0);
      pickup pencircle xscaled .2 scaled 15;
      draw (23,0)--(60,0)
    ) rotated 40 shifted 40up;

    picture ingo;
    ingo := image(
       pickup pencircle scaled 3;
       draw (-10,5)--(12,50);
       draw (20,0)--(12,50);
       draw (35,10)--(12,50)
    ) shifted 10right;

    draw lorno;
    draw ingo;

    pickup pencircle scaled 4;
    draw (80,90);
    draw (70,100);
    draw (55,80);
    draw (50,95);
    draw (100,85);
);

coc_svg(pic,skalo);
% pro cimo en r1.999 PNG-metapost uzu rsvg-convert anstataŭe
coc_png(pic,skalo);

end.
