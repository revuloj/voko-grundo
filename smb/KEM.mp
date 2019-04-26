input centoblecent;
skalo:=1;

picture pic;
pic := image (

path ujo;
ujo := (fullcircle rotated 65)  ..(-.5,.52)
     ..tension1.. (-1.5,-.25){curl0}..tension1.1 ..(-.5,.50)..(-0.19,.47);

    path flamo;
    flamo := (0,0)..(-.2,1)..(0.1,2)..{(1,3)}(.2,2.4){(-1,-3)}..(.2,1)..cycle;

    pickup pencircle scaled 6;
    draw ujo scaled 50 shifted (50,70);

    pickup pencircle scaled 2;
    filldraw flamo scaled 10 reflectedabout ((0,0),up) shifted(27,16);
    filldraw flamo scaled 10 reflectedabout ((0,0),up) shifted(42,16);
    filldraw flamo scaled 10  shifted(57,16);
    filldraw flamo scaled 10  shifted(72,16);

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.

