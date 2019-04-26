input centoblecent;
skalo:=1;

picture pic;
pic := image(
    path kap;
    kap := (8,2){dir100}..(7,5)..{dir100}(0,12)..{right}(10,24)
    ..(20,16){down}..{dir-70}(24,9)..tension4..{dir100}(22,8){dir-70}..tension2..(22.5,2){left}..(20,1.6)
    ..{dir240}(18,0){dir140}..tension2..{left}cycle;

    fill kap scaled 1.25 shifted (8,55.5);

    path korp;
    korp := (20,0){up}..(22,10)..tension3..(20,25)..(10,40)..{right}(16,48){dir110}..(14,50)
    --(18,54){right}..(38,47)--(52,46.5)--(75,66)
    --(80,58)--(55,36)--(68,35.5)--(79,41)
    --(83,32)--(68,26)--(56,26)
    --(63,10)--(58,5)--(62,0)
    --(48,0)--(58,10)--(48,35)
    --(42,35)--(50,15)--(42,0)--cycle;
    filldraw korp;

    % kolumo kaj manikoj
    draw (18,54)--(17,58){right}..{dir-30}(37,53.5)
     --(40,55)--(41,51)--(38,51)--(41,47);
    draw (75,64)--(77,66)--(83,60.5)--(80,58.5);
    draw (79,40)--(81,42)--(85,33.5)--(83,33);

    % manoj kaj bastono
    path dekstra;
    dekstra := (77.5,65.5)..(82,70)..tension2..(90,74)
     ..(89,70)..tension2..(90,65)..tension2..(81.2,62)--cycle;
    fill dekstra;
    draw (85,70)--(100,85) withpen pencircle scaled 1.6;

    path maldekstra;
    maldekstra := (81.5,41)..(83,45)..tension2..(89,48)
     ..tension2..(89,46)--(94,48)..tension1.5..(94,37)..tension2..(84,36)--cycle;
    fill maldekstra;


    %for i=0 upto 15:
    %  z[i] = point i of maldekstra;
    % draw z[i] withcolor red;
    %endfor;
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
