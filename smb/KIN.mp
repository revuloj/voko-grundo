input centoblecent;
skalo:=1;

picture pic;
pic := image (
    
  % path clipping_region[];

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    % pentru la filmvolvajhon nigre - eltondu truon en la mezo
 
    picture film_rulo;
    film_rulo := image(
      fill fullcircle scaled 70;
    );

  %  clipping_region1 := fullcircle scaled 70 -- (10,10)
  %    -- (reverse fullcircle scaled 7)--cycle;

  %  clip film_rulo to clipping_region1;
    draw film_rulo;

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    % pentru la metalan ingon grize - eltondu same truon en la mezo

    path truo;
    truo := (0,10){right}..(5,15)..tension3 ..(17,35)
    ..(15,40)..tension1.5 ..(-15,40)
    ..(-17,35)..tension3 ..(-5,15)..(0,10); %..cycle;

    path truoj;
    truoj := (for a=0 upto 5: (reverse truo rotated (a*60))-- endfor cycle);

    path ingo;
    ingo := (fullcircle scaled 100) -- truoj --cycle;

    picture rulo;
    rulo := image(
      fill ingo withcolor .7white;
    );

 %   clipping_region2 := fullcircle scaled 105 -- (10,10)
 %     -- (reverse fullcircle scaled 7)--cycle;

 %   clip rulo to clipping_region2;

    draw rulo;

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    % desegnu la konturojn
  
    pickup pencircle scaled 1.5;
    draw fullcircle scaled 100;
    filldraw fullcircle scaled 7;
    for a=0 upto 5: 
      draw (reverse truo rotated (a*60));
    endfor;

    % finajho de la filmo, momente ne desegnu, necesas parton 
    % pentri pli frue kun la nigra volvajo...

    %pickup pensquare scaled 8;
    %path film;
    %film := (-31,-40){left}..tension 3..(-60,-50)..tension5..(20,-45)..tension5..{left}(10,-48);

    % draw film  withcolor black;

    %for t=0 upto 7:
    %  z[t]=point t of film;
    %  draw z[t] withpen pencircle scaled 2 withcolor red;
    %endfor;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
