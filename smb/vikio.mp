input centoblecent;
skalo := 1;

picture pic;
pic := image(

 % gradienta kolorigo trovita jen: http://newsgroups.derkeiler.com/Archive/Comp/comp.text.tex/2006-05/msg01202.html

 vardef gradfill(expr p,q,c,d,N) =
  % Make sure that number of gradient fills is an integer %
  save K;
  K:=round(N);

  % Only fill if K>0 %
  if K=1:
    fill p--(reverse q)--cycle withcolor (c+d)/2 withpen currentpen
    scaled 0;
  elseif K>1:
    save a,b,g,l,h,t,k,m;

    % Find a=length(p) and b=length(q) in order to create copies %
    % of p and q. The copies of p and q will have equal length %
    a:=length(p);
    b:=length(q);

    % Compute the GCF and LCM of a and b %
    g:=a; l:=b;
    forever: exitunless g <> l; if g > l: g:=g-l; else: l:=l-g; fi;
    endfor;
    l:=round(a/g*b);

    % Choose the LCM(a,b) which is at least as large as, say, 16 %
    % This will ensure smooth paths for the homotopy %
    l:=ceiling(16/l)*l;

    % Create h[0]=p and h[K]=q %
    path h[];
    h[0]:=(point 0 of p){direction 0 of p}
      ..(point (a/l) of p){direction (a/l) of p};
    h[K]:=(point 0 of q){direction 0 of q}
      ..(point (b/l) of q){direction (b/l) of q};
    for m=2 upto l:
      h[0]:=h[0]..(point (m*a/l) of p){direction (m*a/l) of p};
      h[K]:=h[K]..(point (m*b/l) of q){direction (m*b/l) of q};
    endfor;

    % Here's where we create the homotopy between h[0] and h[K] %
    % After we get h[k] for each 0<k<K, we fill successive cycles %
    % with the appropriate color %
    for k=1 upto K-1:
      t:=k/K;
      h[k]:=((1-t)*(point 0 of h[0])+t*(point 0 of
        h[K])){(1-t)*(direction 0 of h[0])+t*(direction 0 of
          h[K])}..((1-t)*(point 1 of h[0])+t*(point 1 of h[K])){(1-t)*(direction
            1 of h[0])+t*(direction 1 of h[K])};
      for m=2 upto l:
        h[k]:=h[k]..((1-t)*(point m of h[0])+t*(point m of
          h[K])){(1-t)*(direction m of h[0])+t*(direction m of h[K])};
      endfor;
      fill h[k-1]--(reverse h[k])--cycle withcolor
          (1-(k-1)/K)*c+(k-1)/K*d withpen currentpen scaled 0;
    endfor;
    fill h[K-1]--(reverse h[K])--cycle withcolor d withpen currentpen
    scaled 0;
  fi;
 enddef;

  picture V;
  V := image(
        pickup pensquare yscaled 3 xscaled 9 rotated 70;

	draw (25,79)--(45,25)--(65,79);
	%draw (45,79)--(65,25)--(85,79);

	pickup pensquare yscaled 3 xscaled 9;

	draw (20,83)--(28,83);
       % draw (40,83)--(48,83);
	draw (62,83)--(70,83);
       % draw (82,83)--(90,83);


	pickup pensquare yscaled 1 xscaled 8;
	path a[];

	a1:= (20,82){right}..{dir300}(26.6,75);
	a2:= (28,82){left}..{dir300}(26.6,75);
	draw a1;
	draw a2;
       % draw a1 shifted 20 right;
       % draw a2 shifted 20 right;

	pickup pensquare yscaled 1 xscaled 3;

	a3:= (59,82){right}..{dir265}(64.5,79);
	a4:= (72,82){left}..tension1.5..{dir265}(65.2,79);
	draw a3;
	draw a4;
       % draw a3 shifted 20right;
       % draw a4 shifted 20right;
    );

%    path p,q;
%    p := fullcircle shifted (30,90);
%    q := fullcircle scaled 90 shifted (43,58);
%    gradfill(p,q,white,.5white,60);

 
    fill fullcircle scaled 90 shifted (43,58) withcolor .90 white;
    pickup pencircle scaled 3;
    draw fullcircle scaled 90 shifted (43,58);
    draw V yscaled .9 shifted 5up;

);

coc_svg(pic,skalo);
coc_png(pic,skalo);
end.
