/******************* vortspecoj kaj kazoj *************/

pron([_,Speco]) :-
	sub(Speco,'pron').

subst([_,Speco]) :-
	sub(Speco,'subst').

adj([_,'adj']).

art([_,'art']).

prep([_,'prep']).

nombr([_,'nombr']).

% last ne funkcias kiel antau 30 jaroj, do mir redifinis
lasta(Fin,V) :-
  atomic_list_concat(L,',',V),
  lists:last(L,Fin).

subst_nomin([V,Speco]) :-
	sub(Speco,'subst'),
	lasta(Fin,V),
	memberchk(Fin,['o','oj']).

subst_akuz([V,Speco]) :-
	sub(Speco,'subst'),
	lasta(Fin,V),
	memberchk(Fin,['on','ojn']).

pron_nomin([V,Speco]) :-
	sub(Speco,'pron'),
	\+lasta('n',V).

pron_akuz([V,Speco]) :-
	sub(Speco,'pron'),
	lasta('n',V).

adv([_,'adv']).

adj_nomin(Vorto) :-
	Vorto = [V,'adj'],
	lasta(Fin,V),
	memberchk(Fin,['a','aj']).

adj_akuz([V,'adj']) :-
	lasta(Fin,V),
	memberchk(Fin,['an','ajn']).

verbo([_,Speco]) :-
	sub(Speco,'verb').

asisosusu([V,Speco]) :-
	sub(Speco,'verb'),
	lasta(Fin,V),
	memberchk(Fin,['as','is','os','us','u']).

inf([V,Speco]) :-
	sub(Speco,'verb'),
	lasta('i',V).

infprep([_,'infprep']).

intj([_,'intj']).

/******************** subjekto *************/

nominativo([Vorto]) :-
	pron_nomin(Vorto).

nominativo(Vortoj) :-
	substgrupo(Vortoj,'').

/********************* predikato ***********/

predikato([Vorto]) :-
	asisosusu(Vorto).

/******************* vortgrupo **********/

% oni kontrolu, chu ne nur kazo sed ankau nombro
% kongruas inter atributoj kaj subst-oj

substgrp([Vorto],Akuz) :-
	subst_akuz(Vorto), Akuz='n';
	subst_nomin(Vorto), Akuz=''.

substgrp(Vortoj,Akuz) :-
	append(Adj,Resto,Vortoj),
	adjektivo(Adj,Akuz),
	substgrp(Resto,Akuz).

substgrp(Vortoj,Akuz) :-
	append(Resto,Adj,Vortoj),
	adjektivo(Adj,Akuz),
	substgrp(Resto,Akuz).


%substgrp([Pron|Vortoj],Akuz) :-
%        (pron_nomin(Pron), Akuz='';
%        pron_akuz(Pron), Akuz='n'),
%        substgrp(Vortoj,Akuz).


substgrp([Nombr|Vortoj],Akuz) :-
	nombr(Nombr),
	substgrp(Vortoj,Akuz).

% la artikolo povas esti
% nur unue, ne ene de subst-grupo

substgrupo(Vortoj,Akuz) :-
	substgrp(Vortoj,Akuz).

substgrupo([Art|Vortoj],Akuz) :-
	art(Art),
	substgrp(Vortoj,Akuz).

/****************** objekto ****************/

% fakte oni permesu ankau -ion/iun-pronomoj
akuzativo([Vorto]) :-
	pron_akuz(Vorto).

akuzativo(Vortoj) :-
	substgrupo(Vortoj,'n').

/******************* nerekta objekto ********/

prepozitivo([Prep|[Pron]]) :-
	prep(Prep),
	pron(Pron).

prepozitivo([Prep|Vortoj]) :-
	prep(Prep),
	substgrupo(Vortoj,_).

/******************* adverbo ****************/

adverbo([Vorto]) :-
	adv(Vorto).

/******************** adjektivo ***********/

adjektivo([Vorto],Akuz) :-
	adj_akuz(Vorto), Akuz='n'; 
	adj_nomin(Vorto), Akuz=''.

adjektivo([Adv|Vortoj],Akuz) :-
	adv(Adv),
	adjektivo(Vortoj,Akuz).

/****************** predikativo **************/

predikativo(Vortoj) :-
	adjektivo(Vortoj,'').

/******************* nombro ******************/

nombro([Vorto]) :-
	nombr(Vorto).

nombro([V1|Vortoj]) :-
	nombr(V1),
	nombro(Vortoj).

/******************** interjekcio *************/

interjekcio([Vorto]) :-
	intj(Vorto).

/********************* infinitivo *************/

infinitivo([Vorto]) :-
	inf(Vorto).

infinitivo([V1|Vortoj]) :-
	infprep(V1),
	infinitivo(Vortoj).

/********************* frazo ****************/

% frazo estas vico de iuj frazpartoj kiel subjekto, objekto, ktp.
% do eblas ankaý nekompletaj frazoj. Oni poste povas kontroli, æu
% la frazo estas kompleta. Skribitaj frazoj normale estu kompletaj
% parolitaj ne nepre.

% anstatau subj, obj, pred eble uzu demandvortojn
% kio, kiu, kion faras, sed tiukaze necesas ankau
% analizi iomete la sencon

frazeto([],[]).

frazeto(Vortoj,Rezulto) :-
	append(F1,F2,Vortoj),
	nominativo(F1),
	write('nomi '), write_ln(F1),
	frazeto(F2,Rez),
	Rezulto = [[F1,'nomi']|Rez].

frazeto(Vortoj,Rezulto) :-
	append(F1,F2,Vortoj),
	predikato(F1),
	write('pred '), write_ln(F1),
	frazeto(F2,Rez),
	Rezulto = [[F1,'pred']|Rez].

frazeto(Vortoj,Rezulto) :-
	append(F1,F2,Vortoj),
	akuzativo(F1),
	write('akuz '), write_ln(F1),
	frazeto(F2,Rez),
	Rezulto = [[F1,'akuz']|Rez].

frazeto(Vortoj,Rezulto) :-
	append(F1,F2,Vortoj),
	prepozitivo(F1),
	write('prep '), write_ln(F1),
	frazeto(F2,Rez),
	Rezulto = [[F1,'prep']|Rez].

frazeto(Vortoj,Rezulto) :-
	append(F1,F2,Vortoj),
	adverbo(F1),
	write('advb '), write_ln(F1),
	frazeto(F2,Rez),
	Rezulto = [[F1,'advb']|Rez].

frazeto(Vortoj,Rezulto) :-
	append(F1,F2,Vortoj),
	predikativo(F1),
	write('prdk '), write_ln(F1),
	frazeto(F2,Rez),
	Rezulto = [[F1,'prdk']|Rez].

frazeto(Vortoj,Rezulto) :-
	append(F1,F2,Vortoj),
	infinitivo(F1),
	write('infn '), write_ln(F1),
	frazeto(F2,Rez),
	Rezulto = [[F1,'infn']|Rez].


%%%%%%%%%

frazo(Vortoj,Rezulto) :-
	frazeto(Vortoj,Rezulto).

frazo(Vortoj,Rezulto) :-
	append(F1,F2,Vortoj),
	interjekcio(F1),
	write('intj '), write_ln(F1),
	frazeto(F2,Rez),
	Rezulto = [[F1,'intj']|Rez].


/********************* vortigo der litervico ***********************/

litero(C,C1) :-
        C >= 97, C =< 122, C1=C.         % 'a'...'z'
litero(C,C1) :-
        C >= 65, C =< 90, C1 is C-65+97. % 'A'...'Z' -> 'a'...'z'
litero(39,39).                  % apostrofo

legu_vorton([C1|Str],[C|Resto]) :-
	litero(C1,C), !,
        legu_vorton(Str,Resto).
legu_vorton(_,[]).

vort_komenco([C1|Str],RStr) :-
	litero(C1,_),!,
	RStr=[C1|Str];
	vort_komenco(Str,RStr).
vort_komenco(_,[]).

legu_vortojn(LStr,Vortoj) :-
	LStr\=[],!,
	legu_vorton(LStr,LVorto),
	name(Vorto,LVorto),
	append(LVorto,S,LStr),
	vort_komenco(S,RStr),
	legu_vortojn(RStr,Vj),
	Vortoj=[Vorto|Vj].
legu_vortojn(_,[]).

vortigu(Str,Vortoj) :-
	name(Str,LStr),
	legu_vortojn(LStr,Vortoj).

/******************** elig-funkcioj ********************/

eligu_vorterojn([Vortero]) :-
	write(Vortero).

eligu_vorterojn([Vortero|Resto]) :-
	write(Vortero), write(''''),
	eligu_vorterojn(Resto).

eligu_vorton([Vorto,Speco],_) :-
	%eligu_vorterojn(Vorto),
        write(Vorto),
	write(' ('), write(Speco), write(') ').

eligu_frazeron([Frazero,Tipo],_) :-
	write(Tipo), write(' = '),
	maplist(eligu_vorton,Frazero,_), nl.

eligu_strukturon(Frazstrukt) :-
	nl, write_ln('Solvo:'),
	maplist(eligu_frazeron,Frazstrukt,_), !, nl.

/********************* analizaj funkcioj ******************/

povorta_analizo(Signoj,Vortoj) :-
	vortigu(Signoj,Frazo),!,
	maplist(vortanalizo,Frazo,Vortoj).

frazanalizo(Signoj,Rezulto) :-
	vortigu(Signoj,Frazo),!,
	maplist(vortanalizo,Frazo,Vortoj),
	frazo(Vortoj,Rezulto),
	eligu_strukturon(Rezulto).

% tio funkcias nur, æar "vortigu" permesas
% æesi jam antaý la fino de la frazo
% eble tio estas iom neeleganta maniero
parta_frazanalizo(Signoj,Rezulto) :-
	vortigu(Signoj,Frazo),
	maplist(vortanalizo,Frazo,Vortoj),
	frazo(Vortoj,Rezulto),!,
	eligu_strukturon(Rezulto).

