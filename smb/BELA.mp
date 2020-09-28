input centoblecent;
skalo := 1;

picture pic;
pic := image (
    pickup pencircle yscaled 2 xscaled 12 rotated 20;

    %draw fullcircle scaled 100;

    path fl[];

    %tigo
    fl1 := (40,45)..(60,50)..(70,30)..(40,0)..(0,40)..(30,75);
    %folio
    fl2 := (65,20)..(90,30)..(102,20)..(80,-5)..(75,-4);
    %burghono
    fl3 := (65,17)..(80,45)..(90,50)..(105,50)
       --(95,45)..(85,24)..(70,17)--cycle;

    draw fl1;
    draw fl2 shifted 2right shifted 2down;
    draw fl3 shifted 4.6right shifted 9up;

    %for t=0 upto 17:
    %   z[t]=point t of fl3;
    %  draw z[t] withcolor red;
    %endfor;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
