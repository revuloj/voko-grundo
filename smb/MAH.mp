input centoblecent;
skalo:=1;

picture pic;
    pic := image (
    pickup pencircle yscaled 2 xscaled 12 rotated 40; 
    pickup pencircle scaled 1; 

    draw "Ma" infont "cmb10" shifted (1,1.5);
    draw (0,0)--(16.5,0)--(16.5,10)--(0,10)--cycle;
    %label.top(btex \textbf{Ma} etex,(0,0));
    %draw (0,0);

);

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
