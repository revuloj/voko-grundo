input centoblecent;
skalo:=1;

picture pic;
pic := image(

    % ujo
    fill (-30,0){dir140}..{dir100}(-45,25){dir-20}..(0,18)
    ..{dir10}(40,21){dir250}..{dir220}(30,3){dir200}..(10,-2)..{dir160}cycle;

    pickup pencircle scaled 3;

    % masto
    draw (0,15)--(0,100); % withpen pencircle scaled 4;
  
    % veloj
    draw (-5,20){dir160}..{dir180}(-40,25){dir80}..{dir40}(-5,90){dir260}..{dir280}cycle shifted 5 right;
    draw (5,20)--(5,80)--(30,25)--cycle shifted 5left;

    % flago
    fill (-5,92){dir160}..{dir120}(-30,96){dir-20}..{dir-10}(-5,100)--cycle shifted 5 right;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
