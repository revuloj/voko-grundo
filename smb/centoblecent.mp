def centoblecent(expr pic, skalo) =
  save ll,ur, width,height,etendo,factor,xoffset;
  
  pair ll; ll = llcorner pic;
  pair ur; ur = urcorner pic;

  width := xpart ur - xpart ll;
  height :=  ypart ur - ypart ll;
  etendo := max(width,height);

  factor :=  skalo * 90/etendo; 
  xoffset := (100-factor*width)/2;

  show -ll;
  show factor;
  
  draw pic shifted -ll scaled factor shifted(xoffset,5);
  setbounds currentpicture to unitsquare scaled 100;
enddef;

def coc_svg(expr pic,skalo) =
  outputformat := "svg";
  outputtemplate := "%j.%o";
  beginfig(0);
    centoblecent(pic,skalo);
  endfig;
enddef;  

def coc_png(expr pic,skalo) =
  outputformat := "png";
  outputtemplate := "%j.%o";
  outputformatoptions := "format=graya antialias=best";
  beginfig(1);
    centoblecent(pic,skalo);
  endfig;
enddef;  

def coc_rgb_png(expr pic,skalo) =
  outputformat := "png";
  outputtemplate := "%j.%o";
  outputformatoptions := "format=rgba antialias=best";
  beginfig(1);
    centoblecent(pic,skalo);
  endfig;
enddef;

%end.
