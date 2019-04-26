input centoblecent;
skalo:=.9;

picture pic;
pic := image (
     pickup pencircle scaled 3;

    path mask[];

    % konturo
    mask1 := (30,100)..tension2..(10,50)..tension1.8..(60,0)..tension2..(90,60)..(80,70)..tension2..(80,96)..tension2..cycle;

    % nazo
    mask2 := (55,85){down}..tension5..(55,53)..tension5..(45,48)..tension5..(65,48)..tension5..(55,53);

    % brovo maldekstra
    mask3 := (13,80){(-1,2)}..tension1..(18,96){right}..tension1..{(1,-1.8)}(50,73);

    % brovo dekstra
    mask4 := (57,70){(1,1.8)}..(77,88){right}..(82,80);

    % buŝo
    mask5 := (30,45){curl0}..tension1.5..(60,20)..tension1.2..{curl0}(80,45)..(55,35)..cycle;

    % okulo maldekstra
    mask6 := (28,65){up}..(39,72){right}..(53,65){down}..tension5..cycle;

    % okulo dekstra
    mask7 := (60,65){up}..(72,72){right}..{down}(82,65)..tension5..cycle;

    draw mask1;
    draw mask2 shifted 2right;
    draw mask3;
    draw mask4;

    pickup pencircle scaled 2;
    filldraw mask5;

    fill mask6;
    fill mask7;

    % nazopinto
    pickup pencircle scaled 6;
    draw (56,49) shifted 2right;

    %for i=0 upto 25:
     %   z[i] = point i of mask7;
      %  draw z[i] withcolor red;
    %endfor;


);

coc_svg(pic,skalo);
%coc_png(pic,skalo);
end.
