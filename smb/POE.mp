input centoblecent;
skalo:=.9;

picture pic;
pic := image (
    pickup pencircle xscaled 3 yscaled 16 rotated -15;

    % shin (hebrea litero)
    draw (10,80)..tension1..(5,40)..tension1..(14,5)..(15,0);
    draw (15,0)--(50,0);
    draw (40,80)..(35,50)..(16,0);
    draw (80,80)..(75,70)..(65,40)..(50,0);
    draw (75,70)..(64,40)..(47,0);

    path punkto;
    punkto :=  (7,90)..(7,88)..(17,82)..(17,80);

    draw punkto;
    draw punkto shifted 30right;
    draw punkto shifted 63right;
) yscaled .9;

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
