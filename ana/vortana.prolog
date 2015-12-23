/* ANALIZILO POR ESPERANTAJ VORTOJ 
 *
 * (c) 1996 cxe Volframo Distel'
 * kelkaj ideoj kaj la baza vortlisto estas 
 * prenitaj de Simono Pejno
 *
*/

/* La analizilo funkcias per SWI-Prolog,
 * sed certe estas adapteblaj al aliaj dialektoj
 *
 * Kiel funkcias la analizilo:
 *
 * Gxi provas dispartigi vorton kaj rekombini la partojn
 * lau la reguloj de derivado kaj kunmetado. Se eblas tiel,
 * valida dispartigo estas trovita. Ekzistas ankaw pli
 * malstrikta analizo kiu ne konsideras la derivadregulojn.
 *
 * 
 * Pri la rekombinado:  
 *
 * Ekzistas du manieroj kombini vortelementojn:
 * derivado kaj kunmetado. Kunderivado (sur-strat-a) ankoraw
 * ne estas realigita per la analizilo.
 *
 * Cxiu vortelemento havas vortspecon (tipon, ekz. subst, verb)
 * Cxe derivado foje konservigxas la tipo, foje gxi estas
 * sxangxita de la afikso. Cxe kunmetado konservigxas la
 * tipo de la baza, malantawa vorto. 
 *
 * La afiksoj povas aplikigxi nur al certaj tipoj.
 * La sufiksoj foje sxangxas la vorttipon de la
 * vortelemento al kiu gxi aplikigxas.
 * 
 * La vortelementoj kun la tipoj estas listigitaj
 * en la vortaro. 
 *
 * La diversaj vortelementoj estas:
 *   radikoj (r), finajxoj (f), envortaj kunmetoliteroj (c)
 *   vortoj (v), sufiksoj (s), prefiskoj (p), pluralaj pronomoj (u),
 *   ties finajxoj (fu), nepluralaj pronomoj (i), ties finajxoj (fi)
 *
 * La diversaj vortspecoj estas:
 *   best, subst, verb, tr, ntr, adv, adj, pron, perspron,
 *   nombr, intj, advintj, konj, subj, prep, art, parc
 * La specialaj vorspecoj parc (parenco), best (besto), tr, ntr
 * ekzistas, cxar certaj afiskoj (bo, in, ig, igx) aplikigxas
 * al tiuj aw rezultigas en tiuj specoj. 
*/

/*******  hierarkieto  de vortspecoj ****************/

sub(X,X).
% sub(X,Z) :- sub(X,Y), sub(Y,Z).
sub('best','subst').
sub('parc','best').
sub('parc','subst').
sub('ntr','verb').
sub('tr','verb').
sub('perspron','pron').

/*************** derivadreguloj *****************/

% kunigi du vortpartojn S1 kaj S2 kaj alpendigi la
% specon Spec.
% ekz. jun'ul+in+best -> [jun'ul'in,best]

kunigi(Vortero1,Vortero2,Speco,[Vorto,Speco]) :-
	atom_concat(Vortero1,',',V),
	atom_concat(V,Vortero2,Vorto).

kunigi__(Vortero1,Vortero2,Speco,[Vorto,Speco]) :-
	atom_concat(Vortero1,'_',V),
	atom_concat(V,Vortero2,Vorto).

kunigi_(Vortero1,Vortero2,Speco,[Vorto,Speco]) :-
	atom_concat(Vortero1,'-',V),
	atom_concat(V,Vortero2,Vorto).

% derivi vorteron per sufikso.
% ekz. [jun,adj] + [ul,best,adj] -> [jun'ul,best]

derivado_per_sufikso([Vorto,Speco],[Sufikso,AlSpeco,DeSpeco],Rezulto) :-
	sub(Speco,DeSpeco),!,

	% Se temas pri sufikso kun nedifinita DeSpeco, 
	% ekz. s(acx,_,_) au s(ist,best,_) la afero funkcias tiel:
	% sub(X,X) identigas DeSpeco kun Speco
	% Se AlSpeco ankau ne estas difinita ghi estu
	% la sama kiel Speco, tion certigas la sekva
	% identigo, se AlSpeco estas difinita kaj alia
	% ol Speco la rezulta vorto estu de AlSpeco

	% Se nur AlSpeco ne estas difinita, ekz s(in,_,best)
	% la sekva identigo donas la rezultan Specon, tiel
	% frat'in estas "parc" kaj ne nur "best".

	(Speco=AlSpeco,!, % se temas pri sufiksoj kiel s(acx,_,_),
                          % fakte suficxus ekzameni, cxu AlSpeco = _
          kunigi(Vorto,Sufikso,Speco,Rezulto);
	  kunigi(Vorto,Sufikso,AlSpeco,Rezulto)
        ).

% derivi vorteron per prefikso:
% ekz. [mal,adj] + [jun,adj] -> [mal'jun,adj]

derivado_per_prefikso([Prefikso,DeSpeco],[Vorto,Speco],Rezulto) :-
	sub(Speco,DeSpeco),!,
	kunigi(Prefikso,Vorto,Speco,Rezulto).

% kunderivado, simila al prefikso, sed la rezulto
% estas adektiva, ekz. [sen,adj,subst] + [hom,subst] ->[sen'hom,adj]
kunderivado([Prefikso,AlSpeco,DeSpeco],[Vorto,Speco],Rezulto) :-
	sub(Speco,DeSpeco),!,
	kunigi__(Prefikso,Vorto,AlSpeco,Rezulto).

% derivi vorteron per finajxo:
% ekz. [jun,adj] + [e,adv] -> [jun'e,adv]

derivado_per_finajxo([Vorto,Speco],[Finajxo,FinSpeco],Rezulto) :-
	sub(Speco,FinSpeco),!,
	kunigi(Vorto,Finajxo,Speco,Rezulto);
	kunigi(Vorto,Finajxo,FinSpeco,Rezulto).

/********************* sercxo en la vortaro ******************/

% sercxas radikon en la vortaro
% ekz. arb -> [arb, subst]

rad(Sercxajxo,[Sercxajxo,Speco]) :-
	r(Sercxajxo,Speco).

% sercxas konvenan sufikson en la vortaro
% ekz. arbar -> arb + [ar,subst,subst]

suf(Sercxajxo,Resto,[Sufikso,AlSpeco,DeSpeco]) :-
	s(Sufikso,AlSpeco,DeSpeco),
	atom_concat(Resto,Sufikso,Sercxajxo).

% sercxas konvenan finajxon en la vortaro
% ekz. arbon -> arb + [on, subst]

fin(Sercxajxo,Resto,[Finajxo,Speco]) :-
	f(Finajxo,Speco),
	atom_concat(Resto,Finajxo,Sercxajxo).

% sercxas konvenan prefikson en la vortaro
% ekz. maljuna -> juna + [mal,_]

pre(Sercxajxo,Resto,[Prefikso,DeSpeco]) :-
	p(Prefikso,DeSpeco),
	atom_concat(Prefikso,Resto,Sercxajxo).

% sercxas konvenan psewdoprefiskon por kunderivado
% ekz. internacia -> nacia + [inter,adj,subst]

pre2(Sercxajxo,Resto,[Prefikso,AlSpeco,DeSpeco]) :-
	p(Prefikso,AlSpeco,DeSpeco),
	atom_concat(Prefikso,Resto,Sercxajxo).

% sercxas konvenan j-pronomojn (cxiu, kia,...) en la vortaro
% ekz. cxiujn -> jn + [cxiu,pron]

j_pro(Sercxajxo,Resto,[Pronomo,Speco]) :-
	u(Pronomo,Speco),
	atom_concat(Pronomo,Resto,Sercxajxo).

% sercxas konvenan n-pronomon (io, mi,...) en la vortaro
% ekz. min -> n + [mi,perspron]

n_pro(Sercxajxo,Resto,[Pronomo,Speco]) :-
	i(Pronomo,Speco),
	atom_concat(Pronomo,Resto,Sercxajxo).

% sercxas konvenan inter-literon (o, a) en la vortaro
% ekz. pago -> pag + [o,subst]

int(Sercxajxo,Resto,[Litero,Speco]) :-
	c(Litero,Speco),
	atom_concat(Resto,Litero,Sercxajxo).

/******************** malstrikta vortanalizo ******
 * analizas vorton sen konsideri
 * striktajn derivadregulojn laý la funkcioj
 * derivado_per_*. Do afiksoj povas aplikiøi
 * tie æi al æiaj vortspecoj.
****************************************************/

% radiko
vort_sen_fin_malstrikta(Vorto,Rezulto) :- 
	rad(Vorto,Rezulto).  

% prefikso
vort_sen_fin_malstrikta(Vorto,Rezulto) :-               
	pre(Vorto,Resto,[Prefikso,_]),
	atom_length(Resto,L), L>1,
	vort_sen_fin_malstrikta(Resto,[Vsf,Speco]),
	kunigi(Prefikso,Vsf,Speco,Rezulto).

% sufikso
vort_sen_fin_malstrikta(Vorto,Rezulto) :-             
	suf(Vorto,Resto,[Sufikso,AlSpeco,_]),
	atom_length(Resto,L), L>1,
	vort_sen_fin_malstrikta(Resto,[Vsf,_]),
	kunigi(Vsf,Sufikso,AlSpeco,Rezulto).

% kunderivajho
vort_sen_fin_malstrikta(Vorto,Rezulto) :-             
	pre2(Vorto,Resto,[Prefikso,AlSpeco,_]),
	atom_length(Resto,L), L>1,
	vort_sen_fin_malstrikta(Resto,[Vsf,_]),
	kunigi(Prefikso,Vsf,AlSpeco,Rezulto).

% vorteto
vorto_malstrikta(Vorto,[Vorto,Speco]) :-             
	v(Vorto,Speco).

% j-pronomo, eble kun finajxo
vorto_malstrikta(Vorto,Rezulto) :-               
	j_pro(Vorto,Resto,[Pronomo,Speco]),
	(
	    Resto='', Rezulto = [Pronomo,Speco];
	    fu(Resto,_), kunigi(Pronomo,Resto,Speco,Rezulto)
	).

% n-pronomo
vorto_malstrikta(Vorto,Rezulto) :-              
	n_pro(Vorto,Resto,[Pronomo,Speco]),
	(
	    Resto='', Rezulto = [Pronomo,Speco];
	    fi(Resto,_), kunigi(Pronomo,Resto,Speco,Rezulto)
	).

% iu vorto derivita el radiko kaj kun finajxo
vorto_malstrikta(Vorto,Rezulto) :-               
	fin(Vorto,Resto,Finajxo),
	atom_length(Resto,L), L>1,
	vort_sen_fin_malstrikta(Resto,Vsf),
	derivado_per_finajxo(Vsf,Finajxo,Rezulto).

% pronomoj
unua_vortparto_malstrikta(Vorto,[Vorto,Speco]) :-       
	u(Vorto,Speco).

unua_vortparto_malstrikta(Vorto,[Vorto,Speco]) :-             
	i(Vorto,Speco).

% iu vorto derivita el radiko
unua_vortparto_malstrikta(Vorto,Rezulto) :-             
	vort_sen_fin_malstrikta(Vorto,Rezulto).

% iu vorto derivita el radiko kaj kun inter-litero (o,a)
unua_vortparto_malstrikta(Vorto,Rezulto) :-            
	int(Vorto,Resto,Litero),
	atom_length(Resto,L), L>1,
	vort_sen_fin_malstrikta(Resto,Vsf),
	derivado_per_finajxo(Vsf,Litero,Rezulto).

% pluraj kunmetitaj vortoj
unua_vortparto_malstrikta(Vorto,Rezulto) :-            
	% iel dismetu la vorton en partojn kun almenau du literoj
	atom_concat(Parto1,Parto2,Vorto),
	atom_length(Parto1,L1), L1 > 1,
	atom_length(Parto2,L2), L2 > 1,

	% analizu la du partojn
	unua_vortparto_malstrikta(Parto1,[Vorto1,_]),
	unua_vortparto_malstrikta(Parto2,[Vorto2,Speco]),
	kunigi_(Vorto1,Vorto2,Speco,Rezulto).


% analizi kunmetitan vorton	                   
kunmetita_vorto_malstrikta(Vorto,Rezulto) :-
        % iel dismetu la vorton en partojn kun almenau du literoj
	atom_concat(Parto1,Parto2,Vorto),
	atom_length(Parto1,L1), L1 > 1,
	atom_length(Parto2,L2), L2 > 1,

	% analizu la du partojn
	unua_vortparto_malstrikta(Parto1,[Vorto1,_]),
	vorto_malstrikta(Parto2,[Vorto2,Speco]),
	kunigi_(Vorto1,Vorto2,Speco,Rezulto).


/********************* strikta vortanalizo ****************
 * æe tio la afiksoj aplikiøas nur al certaj vortspecoj
 * kiel difinita en la vortaro.
*/

% radiko
vort_sen_fin(Vorto,Rezulto) :- 
	rad(Vorto,Rezulto).   

% prefikso
vort_sen_fin(Vorto,Rezulto) :-            
	pre(Vorto,Resto,Prefikso),
	atom_length(Resto,L), L>1,
	vort_sen_fin(Resto,Vsf),
	derivado_per_prefikso(Prefikso,Vsf,Rezulto).

% sufikso
vort_sen_fin(Vorto,Rezulto) :-            
	suf(Vorto,Resto,Sufikso), 
   	atom_length(Resto,L), L>1,
	vort_sen_fin(Resto,Vsf),
	derivado_per_sufikso(Vsf,Sufikso,Rezulto).

% kunderivajho
vort_sen_fin(Vorto,Rezulto) :-            
	pre2(Vorto,Resto,Prefikso), 
   	atom_length(Resto,L), L>1,
	vort_sen_fin(Resto,Vsf),
	kunderivado(Prefikso,Vsf,Rezulto).

% vorteto
vorto(Vorto,[Vorto,Speco]) :-              
	v(Vorto,Speco).

% j-pronomo
vorto(Vorto,Rezulto) :-             
	j_pro(Vorto,Resto,[Pronomo,Speco]),
	(
	    Resto='', Rezulto=[Pronomo,Speco];
	    fu(Resto,_), kunigi(Pronomo,Resto,Speco,Rezulto)
	).

% n-pronomo
vorto(Vorto,Rezulto) :-              
	n_pro(Vorto,Resto,[Pronomo,Speco]),
	(
	    Resto='', Rezulto=[Pronomo,Speco];
	    fi(Resto,_), kunigi(Pronomo,Resto,Speco,Rezulto)
	).

% mal+prep, mal+adv
vorto(Vorto,Rezulto) :-
	atom_concat('mal',Resto,Vorto),
	atom_length(Resto,L), L>1,
	v(Resto,Speco),
	(Speco='adv'; Speco='prep'),
	derivado_per_prefikso(['mal',_],[Resto,Speco],Rezulto).

% vorto derivita el radiko kaj kun finajxo
vorto(Vorto,Rezulto) :-              
	fin(Vorto,Resto,Finajxo),
	atom_length(Resto,L), L>1,
	vort_sen_fin(Resto,Vsf),
	derivado_per_finajxo(Vsf,Finajxo,Rezulto).


% pronomoj
unua_vortparto(Vorto,[Vorto,Speco]) :-            
	u(Vorto,Speco).

unua_vortparto(Vorto,[Vorto,Speco]) :-
	i(Vorto,Speco).

% vorto derivita el radiko sen finajxo
unua_vortparto(Vorto,Rezulto) :-  
	vort_sen_fin(Vorto,Rezulto).

% vorto derivita el radiko kaj inter-litero (o,a)
unua_vortparto(Vorto,Rezulto) :-          
	int(Vorto,Resto,Litero),
	atom_length(Resto,L), L>1,
	vort_sen_fin(Resto,Vsf),
	derivado_per_finajxo(Vsf,Litero,Rezulto).

% pluraj vortoj
unua_vortparto(Vorto,Rezulto) :-   
        % iel dismetu la vorton en partojn kun almenau du literoj
	atom_concat(Parto1,Parto2,Vorto),
	atom_length(Parto1,L1), L1 > 1,
	atom_length(Parto2,L2), L2 > 1,
   
	% analizu la du partojn
	unua_vortparto(Parto1,[Vorto1,_]),
	unua_vortparto(Parto2,[Vorto2,Speco]),
	kunigi_(Vorto1,Vorto2,Speco,Rezulto).

% analizi kunmetitan vorton	                   
kunmetita_vorto(Vorto,Rezulto) :-
        % iel dismetu la vorton en partojn kun almenau du literoj
	atom_concat(Parto1,Parto2,Vorto),
	atom_length(Parto1,L1), L1 > 1,
	atom_length(Parto2,L2), L2 > 1,

	% analizu la du partojn
	unua_vortparto(Parto1,[Vorto1,_]),
	vorto(Parto2,[Vorto2,Speco]),
	kunigi_(Vorto1,Vorto2,Speco,Rezulto).

/*********** analizfunkcioj ******/

vortanalizo_strikta(Vorto,Rezulto) :-
	vorto(Vorto,Rezulto).
vortanalizo_strikta(Vorto,Rezulto) :-
	kunmetita_vorto(Vorto,Rezulto).

vortanalizo_malstrikta(Vorto,Rezulto) :-
	vorto_malstrikta(Vorto,Rezulto).
vortanalizo_malstrikta(Vorto,Rezulto) :-
	kunmetita_vorto_malstrikta(Vorto,Rezulto).

vortanalizo(Vorto,Rezulto) :-
	% trovu æiujn strikte analizeblajn eblecojn
	vortanalizo_strikta(Vorto,R) *->
	Rezulto=R;
	% se ne ekzistas strikta ebleco, trovu malstriktajn
	vortanalizo_malstrikta(Vorto,[V,S]),
	atom_concat('!',V,R), Rezulto=[R,S].

% por neinteraga moduso kun fina marko
vortanalizo_markita(Vorto,Rezulto) :-
	vortanalizo(Vorto,Rez),
	term_to_atom(Rez,Str),
	atom_concat(Str,'###',Rezulto).

/**************** helpfunkcioj por legi el dosiero *************/

% æu litero?
is_letter(C,C1) :-
	C >= 97, C =< 122, C1=C.         % 'a'...'z'
is_letter(C,C1) :-
	C >= 65, C =< 90, C1 is C-65+97. % 'A'...'Z' -> 'a'...'z'
is_letter(39,39).                  % apostrofo

% æu alia signo?
is_sign(C) :-
	memberchk(C,",.- "), put(C).

% legi vorton el dosiero
legu_vorton1(F,[C|R]) :-
	get0(F,C1), 
	is_letter(C1,C), !,
	legu_vorton1(F,R).
legu_vorton1(_,[]).

legu_vorton2(F,[C|R]) :-
	get0(F,C1),
	(
         is_letter(C1,C), !;
	 is_sign(C1),!,fail
	),
	legu_vorton2(F,R).
legu_vorton2(_,[]).

/********** analizi unuopajn vortoj aý tutajn tekstojn ***************/

% analizas unuopan vorton
analizu_vorton(N) :-
	not(N = ''),
	(
	    vortanalizo_strikta(N,Y), write(Y);
	    vortanalizo_malstrikta(N,Y), write('malstrikte: '), write(Y);
	    write(' ne analizebla: '),write(N)
	),nl,!.

% analizas unuopan vorton kaj redonas øin se analizebla
% aý enkrampigas øin, se ne analizebla
kontrolu_vorton(N) :-
	not(N = ''),
	(
	    vortanalizo_strikta(N,_), write(N), write(' ');
	    vortanalizo_malstrikta(N,Y), write(Y), write(' ');
	    write('['),write(N),write('] ')
	),!.

% analizas tutan tekstodosieron
analizu_tekston(Txt) :-
%	legu,
	open(Txt,read,F),!,
	repeat,
  	legu_vorton1(F,X), name(N,X),
	(analizu_vorton(N);true),
	at_end_of_stream(F),!,close(F).

% kontrolas tutan tekstodosieron
kontrolu_tekston(Txt) :-
%	legu,
	open(Txt,read,F),!,
	repeat,
  	legu_vorton2(F,X), name(N,X),
	(kontrolu_vorton(N);true),
	at_end_of_stream(F),!,close(F).




