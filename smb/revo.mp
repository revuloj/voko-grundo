input centoblecent;
skalo:=.9;
color bgcol; bgcol:=(.852,.645,.125);

picture pic;
pic := image (
    path round;
    round := subpath (0, 6.8) of fullcircle rotated 10 scaled 100 shifted (53,55);

    path iheliko;
    iheliko := (33,67){dir-20}..tension4..(42,60){dir-20}..tension2..{dir240}(42,22){dir0}..tension2..{dir100}(68,52){dir-10}..tension1 and .8..round{dir160}..(78,32);

    fill fullcircle scaled 130 shifted (53,55) withcolor bgcol;

    pickup pencircle scaled 8;
    draw iheliko;
    fill fullcircle scaled 18 shifted (75,77);
);

%picture pica;
%pica := image (
%   draw pic shifted (0,10) scaled 12;
%);

coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.
