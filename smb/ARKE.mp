input centoblecent;
skalo := 1;

picture pic;
pic := image (
  path martelo;
  martelo := (0,0)..(-5,1)--(-4,50)--(-3,54)--(-3,74)..(-4,80)
  --(-20,78)--(-20,86)..(0,87)..(31,78)
  --(30,77)..(20,79)
  --(4,80)..(3,74)--(3,54)--(4,50)--(5,1)..cycle;

  fill martelo rotated 45 shifted 50 right;
  fill martelo reflectedabout ((0,0),(0,1)) rotated -45 shifted 10 left;
);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
