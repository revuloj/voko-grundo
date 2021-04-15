input centoblecent;
skalo:=1;

% piktogramo por tezaŭro (tridirekta sago)

picture pic;
pic := image (

    picture sagoA;
    picture sagoB;

    sagoA := image(
        pickup pencircle scaled 12;
        %draw (-29,-17) -- (-40,0)--(45,0) -- (29,17);
        draw (-40,0)--(45,0) -- (29,17);
    );

    sagoB := image(
        pickup pencircle scaled 12;
        draw (-40,0) -- (45,0) -- (29,17);
        draw (29,-17) --  (45,0);
    );

    draw sagoA shifted 40 up; % shifted 5 left;
    draw sagoB rotated 90 shifted 15 down;
);
coc_svg(pic,skalo);
coc_png(pic,skalo);

end.