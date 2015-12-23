%encoding('utf8').

% ciferoj, t.e. nombroj de 1 ghis 9

nul --> "nul";"nulo".
dek --> "dek".
cent --> "cent".
mil --> "mil".
miliono --> "miliono";"milionoj".

unu(1) --> "unu".
du(2) --> "du".
tri(3) --> "tri".
kvar(4) --> "kvar".
kvin(5) --> "kvin".
ses(6) --> "ses".
sep(7) --> "sep".
ok(8) --> "ok".
nau(9) --> "naux"; "na\u016d"; "nau".

%dek(10) --> [dek].

cifero(N) --> unu(N); du(N); tri(N); kvar(N); kvin(N); ses(N); sep(N); ok(N); nau(N).

% unuoj

unuoj(0) --> "".
unuoj(N) --> cifero(N).

% dekoj, t.e. 10, 20 ... 90

dekoj(0) --> "".
dekoj(10) --> dek.

dekoj(N) -->
  cifero(C), dek,
  { N is C*10 }.

% centoj, t.e. 100, 200, ... 900

centoj(0) --> "".
centoj(100) --> cent.

centoj(N) -->
  cifero(C), cent,
  { N is C*100 }.

% ekz. uzo: phrase(centoj(N),"okcent",[]). -> N=800

spaco --> " "; "".

n3(0) --> nul.
n3(N) --> 
  centoj(C), spaco, dekoj(D), spaco, unuoj(U),
  { N is C+D+U }.

% ekz. uzu: phrase(n3(N),"okcent unu",[]),!.

n3_(1) --> "".
n3_(N) --> n3(N).

n6(1000) --> mil.
n6(N) --> n3(N).
%n6(N) --> n3(N1), spaco, mil, { N is N1 * 1000 }.
%n6(N) --> mil, spaco, n3(N1), { N is N1 + 1000 }.
n6(N) --> n3_(N1), spaco, mil, spaco, n3(N2), { N is N1 * 1000 + N2 }.

kaj --> " kaj ";" ".
n6_(1) --> "".
n6_(N) --> n6(N).

n12(1000000) --> miliono.
n12(N) --> n6(N).
%n12(N) --> n6(N1), spaco, miliono, { N is N1 * 1000000 }.
%n12(N) --> miliono, spaco, n6(N1), { N is 1000000 +  N1 }.
n12(N) --> n6_(N1), spaco, miliono, kaj, n6(N2), { N is N1 * 1000000 + N2 }.

%inventi nombrojn: phrase(n12(N),L,[]),atom_codes(X,L).

nombro(Nombro,N) :-
  atom(Nombro),
  atom_codes(Nombro,List),
  phrase(n12(N),List,[]),!.

% tio funkcias, sed tre malrapida, do nur proksimume ghis 5-ciferaj nombroj 

%nombro(Nombro,N) :-
%  integer(N),
%  phrase(n12(N),List,[]),
%  atom_codes(Nombro,List),!.

%nombru(De,Ghis) :-
%  between(De,Ghis,N),
%  nombro(Nombro,N),
%  write(Nombro),nl,fail.




