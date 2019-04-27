# voko-grundo

La bazaj partoj de la projekto Vortaroj por Komputiloj (Voko), kiuj estas uzataj komune de la diversaj aktivaj partoj kiel la publika servo (voko-araneo k.a.), la transformilo (voko-formiko k.a.), la redaktilo (voko-cetonio k.a.)...

Atentu, ke la momente uzata kodo ankoraŭ troivĝas tie ĉi: https://sourceforge.net/projects/retavortaro/, dum tie ĉi okazas rekonstruo, por uzi la unuopajn partojn pli flekseble kaj laŭ la modelo de servetoj (docker-procesumoj).

Sur la projekto fondiĝis ĝis nun du vortaroj: Reta Vortaro http://reta-voratro.de kaj Astronomia Terminaro https://web.archive.org/web/20090709225214/http://www.esperanto.org/AEK/AT, sed nur la unua travivis la jarojn.

Baze la vortaro konsistas el artikoloj en XML sekvante dokumenttipdifinon (DTD) kaj tradukitaj al la fina vortaro kun ĉiuj indeksoj per XSL-transformoj.

La kadron por apliki la transformojn donas Formiko (Ant).

Dispartigante la partojn ni havos proksimume la sekvajn:
- Araneo - la retservo por Revo, baziĝas sur Apache httpd
- Abelo - la datumbazo kaj serĉilo, baziĝas sur MySQL + Perloskriptoj
- Heliko - la retpoŝtilo, baziĝas sur Postfix
- Ostro - la redaktoservo / akceptilo, baziĝas sur Perloskripto + CVS
- Formiko - la transformilo, baziĝas sur Apache Ant + Java
- Cetonio - la redaktilo, baziĝas sur SWI-Prolog
- Cikado - citaĵoservo / tekstserĉilo, baziĝas sur SWI-Prolog
- Akrido - la vortanalizilo, baziĝas sur SWI-Prolog 
- Grilo - la sintakskontrolio laŭ RelaxNG baziĝanta sur Java + Jing-Trang
