input centoblecent;
skalo := 1.1;

picture pic;
pic := image (
    pickup pencircle scaled .3;

    phi = (0.5 * (1 + sqrt(5))) * (0.5 * (1 + sqrt(5)));
    unit = 1;

    path line[];

    line1 := ((0,0)--(phi,0)) shifted (.82,1.12);
    line2 := ((0,0)--(-phi,0)) shifted (-.82,1.12);


    for i=0 upto 4:
      draw line1 rotated (i*72);
    endfor;

    for j=0 upto 4:
      draw line2 rotated (j*72);
    endfor;

    picture e;

    e := image(
      pickup pensquare scaled .4;
      draw ((.7,.8)--(-.5,.8)--(-.5,-1)--(.85,-1)) shifted .1left;
      draw ((-.5,.05)--(.5,.05)) shifted .1 left
    ) scaled .8;

    draw e;
  
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
