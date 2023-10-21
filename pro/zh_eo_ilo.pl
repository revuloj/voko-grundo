% (c) 2023 Wolfram Diestel
% laŭ GPL 2.0
%
% helpas trovi ĉinajn tradukojn per manklisto eo_de kaj publika vortaro han_de (handedict)
% komparante ambaŭ listojn. Akceptitaj proponoj iras al cellisto, kiun ni poste povos ŝovi en la 
% vortaron per merge_trd_xml.pl

:- use_module(library(csv)).
:- use_module(library(isub)).


:- dynamic manko/6, zhde/2.

/* ricevi vortojn sen trd 'zh' kun evtl. trd 'de'

  SELECT r3mrk.mrk, r3kap.kap, r3mrk.num, r3ofc.dos, de.ind, de.trd FROM r3mrk 
  LEFT JOIN r3trd AS zh ON (zh.mrk = r3mrk.mrk or zh.mrk = r3mrk.drv) AND zh.lng = 'zh' 
  LEFT JOIN r3trd AS de ON (de.mrk = r3mrk.mrk or de.mrk = r3mrk.drv) AND de.lng = 'de' 
  LEFT JOIN r3kap ON r3kap.mrk = r3mrk.drv 
  LEFT JOIN r3ofc ON r3kap.mrk = r3ofc.mrk
  WHERE r3mrk.mrk like 'a%' AND ele = 'snc' AND zh.mrk IS NULL 
  ORDER BY r3mrk.mrk LIMIT 200;
*/

csv_mankoj('tmp/eo_zh_mank.csv').

/* HanDeDict
 vd http://www.handedict.de/chinesisch_deutsch.php?mode=dl
 traduki la prononcindikojn de handedict, ekzemploj
 bei3 jing1 -> běi jīng
 kao3 ya1 ->  kǎo yā
*/

csv_hande('tmp/handedict_nb.u8').

csv_celo('tmp/eo_zh.csv').

legu :-
    csv_mankoj(M),
    legu_csv(manko, M, [separator(0';),skip_header('#')]),

    csv_celo(C),
    legu_csv(celo, C, [separator(0';),skip_header('#')]),

    csv_hande(H),
    legu_csv(hande, H, [separator(0'/),ignore_quotes(true),skip_header('#'),match_arity(false)]),
    hande_redukt.
    
% legas CSV-dosieron kaj kreas faktojn    
legu_csv(Pred,Dos,Opt) :-    
    csv_read_file(Dos, Dat, Opt),
    forall(
        member(R, Dat),
        (
            R =.. [_|L],
            Fakto =.. [Pred|L],
            assertz(Fakto)
        )
    ).

% handedict havas inter 3 kaj 22 kampojn - lasta kutime malplena
% ni transformas tion al duopoj
hande_redukt :-
    forall((
        between(3,22,A),
        functor(F,hande,A),
        catch(F,_,true),
        F =.. [_,Zh|De],
        member(D,De),
        D \= ''
        ),
        assertz(zhde(Zh,D))
    ).

% provu trovi parojn eo - zh uzante ambaŭ vortarojn eo-de kaj zh-de
eo_zh(Eo,Zh,De,D,Simil) :- 
    manko(Mrk,Eo,No,Ofc,DeI,DeT),
    once((
        DeT \= 'NULL', DeT \= '', De = DeT
        ;
        DeI \= 'NULL', DeI \= '', De = DeI
    )),
    once((
        zhde(Zh,De),
        D = De,
        Simil = 1
        ;
        zhde(Zh,De),
        D = De,
        Simil = 1
        ;
        zhde(Zh,D),
        kmp_isub(De,D,Simil)
        ;
        zhde(Zh,D),
        kmp_ngram(De,D,Simil)
    )).


kmp_isub(T1,T2,Simil) :-
    downcase_atom(T1,S1),
    downcase_atom(T2,S2),
    isub(S1,S2,Simil,[zero_to_one(true)]),
    Simil > 0.5 .

kmp_ngram(T1,T2,Simil) :-
    atom_length(T1,L), L>3,
    ngrams(T1,4,NGrams),
    kmp_ngram_(NGrams,T2,Simil),
    Simil > 0.3. %0.3 .

kmp_ngram_(NGrams,Atom,Percentage) :-
    proper_length(NGrams,Len), Len>0,
    ngram_count(NGrams,Atom,0,Count),
    Percentage is Count / Len.   % >= 0.7    


ngram_count([],_,C,C).
ngram_count([NGram|More],Atom,C,Count) :-
    once((
	sub_atom(Atom,_,_,_,NGram),
	C1 is C+1
	;
	C1=C
    )),
    ngram_count(More,Atom,C1,Count).
  
%! ngrams(+Atom,+Len,-NGramoj) is det
%
% Dishakas =Atom= en n-gramojn kun la longo =N=.
ngrams(Atom,Len,NGrams) :- 
  setof(NGram,A^B^sub_atom(Atom,B,Len,A,NGram),NGrams).    