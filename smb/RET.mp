input centoblecent;
skalo:=.9;

picture pic;
pic := image (
    path round;
    round := subpath (0, 7) of fullcircle rotated 10 scaled 100 shifted (53,55);

    path iheliko;
    iheliko := (36,50){dir60}..tension4..(51,65)..tension6..{dir260}(46,20){dir80}..tension6..{dir80}(64,65){dir-90}..tension1 and .8..round;

    pickup pencircle scaled 6;
    draw iheliko;
    draw fullcircle scaled 10 shifted (55,80);


    %for t=0 upto 12:
    %   z[t]=point t of iheliko;
    %  draw z[t] withpen pencircle scaled 1 withcolor red;
    %endfor;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);

end.
