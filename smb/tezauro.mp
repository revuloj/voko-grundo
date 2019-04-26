input centoblecent;
skalo:=1.05;

picture pic;
pic := image(
path spuro[];
    spuro1 := (0,0){left}..{up}(-15,15)..{up}(-15,28){right}
    ..{right}(15,28){down}..(15,15)..cycle;

    spuro2 := (-15,40){up}..(-14,65){dir85}..tension1.4..(7,100){right}
    ..tension 1.2..(22,70)..{dir250}(15,40){dir 150}
    ..(0,45)..{dir 210}cycle;

    drawoptions(withcolor .5green);
    fill spuro1; fill spuro2;
    fill spuro1 reflectedabout ((25,0),(35,100)) shifted 20down;
    fill spuro2 reflectedabout ((25,0),(35,100)) shifted 20down;

) rotated -40;

coc_svg(pic,skalo);
coc_rgb_png(pic,skalo);
end.
