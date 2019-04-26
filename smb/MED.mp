input centoblecent;
skalo:=1.05;

% bastono de Aeskulap simbolanta kuracarton
% ne konfuzenda kun bastono de Hermeso (kun du serpentoj kaj paro de flugiloj) - simbolanta la komercon

picture pic;
pic := image (
    pickup pencircle scaled 1;

    path baston[];
    baston1 := (0,0)..(-2,5)..tension14..(-2.2,16.5){up}
    --(2.2,16.5){down}..tension10..(2,5)..{curl0}cycle;

    baston2 := (-2.2,20)--(-2.3,44.5)--(2.3,45.5)--(2.2,21)--cycle;

    baston3 := (-2.3,50.5)--(-2.9,80){(6,1)}..(2.9,80)--(2.3,51.6)--cycle;

    baston4 := (-2.9,86.5){up}..{up}(-2.9,90)..(-5,92)..(0,96)..(5,92)
    ..(2.9,90){down}..{down}(2.9,86.4)--cycle;

    fill baston1;
    fill baston2;
    fill baston3;
    fill baston4;

    %pickup pencircle scaled 1.5;
    %draw (1.5,70){up}..(5,75)..{(1,2)}(7,77);

    path serpent[];
    serpent1:= (-8,15){(1,5)}..(0,20){(3,1)}..(7,25)..tension1.3 ..{(-2,1)}(2.9,28){curl0}--(2.9,33){(3,-1)}..tension1.2
    ..(12,25){down}..(0,17)..{(-1,-1)}cycle;

    serpent2:=(-2.9,30){(-2,1)}..tension1.3..(-20,40){up}..tension1.3..{(5,2)}(0,50.5)..tension1.3..(10,55){up}..tension1.3..{(-3,1)}(3,60)
    --(3,65){(4,-1)}..(15,54.5)..{(-5,-2)}(0,45.7){(-5,-2)}..tension1.7..(-14,39.8)..tension1.7..{(2,-1)}(-2.9,35)--cycle;

    serpent3:=(-3.2,61){(-3,1)}..(-20,75)..{right}(0,86)
    ..tension4..(14,84)..tension1..(19,83.5)..tension2..(24,77)
    ..tension2..(16,78)
    ..tension2.3..(0,81){left}
    ..(-14,75){down}..tension1 ..{(3,-1)}(-3.2,66)--cycle;

    fill serpent1;
    fill serpent2;
    fill serpent3;

    fill fullcircle xscaled 2 rotated -22 shifted (18,80) withcolor white;

    pickup pencircle scaled .7;
    draw (24,77)..(26,76.2)..(30,75);
    draw (24,77)..(26,76)..(29,73);


    pickup pencircle scaled 2;

    %for i:=0 upto 20:
    %  z[i] = point i of baston4;
    %  draw z[i] withcolor red;
    %endfor;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
