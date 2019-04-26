input centoblecent;
skalo:=.9;

picture pic;
pic := image (
  pickup pencircle scaled 7;
  path half; 
  half := (50,0){(-1,2)}..(5,80){up}..(30,100)..{(1,-2)}(50,80);
  draw half xscaled .9 scaled .9 shifted 7 right shifted 3 up;
  draw half reflectedabout ((50,0),(50,100)) xscaled .9 scaled .9 shifted 7 right shifted 3 up;
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
