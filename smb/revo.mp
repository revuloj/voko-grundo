input centoblecent;
skalo:=.9;
color bgcol; bgcol:=(.852,.645,.125);

picture pic;
pic := image (
    path round;
    round := subpath (0, 6.8) of fullcircle rotated 25 scaled 100 shifted (53,55);

    path iheliko;
    iheliko := (24,62){dir0}..tension4..(42,62)..tension6..{dir260}(46,20){dir80}..tension6..{dir80}(65,62){dir0}..tension1 and .8..round;

    %pickup pencircle scaled 6;
    fill fullcircle scaled 120 shifted (53,55) withcolor bgcol;

    pickup pencircle scaled 9;
    draw iheliko;
    fill fullcircle scaled 24 shifted (55,80);


    %for t=0 upto 12:
    %   z[t]=point t of iheliko;
    %  draw z[t] withpen pencircle scaled 1 withcolor red;
    %endfor;

);

%picture pica;
%pica := image (
%   draw pic shifted (0,10) scaled 12;
%);

coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);

end.
