input centoblecent;
skalo:=1;

picture pic;
pic := image (

    pickup pencircle scaled 6; 

    draw ((20,0){(7,10)}..tension35..(90,100)..(93,97)..tension35..(58,44)..(50,40)) shifted 7 right rotated 5;



    picture forko;
    forko := image(

    pickup pencircle scaled 6; 
    draw (80,0)--(36,64);
    draw (25.9,62.5){(right)}..(41,72);

    pickup pencircle scaled 4 ;

    path arc;
    % arc := (3,85)..tension25..(20,60)..tension3..(44,77)..tension25..(28,100);

    arc := (0,30)..tension25..(0,0)..tension2..(20,0)..tension25..(20,30);

    draw arc rotated 35 shifted (25,62);

    draw (36,64)--(18,90);
    );

    draw forko shifted 20 left shifted 12 up rotated -5;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
