# voko-grundo

La bazaj rimedoj de la projekto Vortaroj por Komputiloj (Voko), kiuj estas uzataj komune de la diversaj aktivaj partoj kiel la publika servo (voko-araneo k.a.), la transformilo (voko-formiko k.a.), la redaktilo (voko-cetonio k.a.)...

Atentu, ke momente por duono de la programaro ankoraŭ estas uzata kodo, kiu troviĝas tie: https://sourceforge.net/projects/retavortaro/, dum tie ĉi okazas rekonstruo, por uzi la unuopajn partojn pli flekseble kaj laŭ la modelo de servetoj (`docker`-procezujoj). Por la transformado jam estas uzataj voko-grundo kaj voko-formiko
kaj la nova fasado de Revo ricevas siajn stilojn kaj skriptojn parte de tie ĉi kaj parte de voko-araneo.

Sur la projekto Voko, fondita en 1997 baziĝis ĝis nun du vortaroj: [Reta Vortaro](http://reta-voratro.de) kaj 
[Astronomia Terminaro](https://web.archive.org/web/20090709225214/http://www.esperanto.org/AEK/AT),
sed nur la unua travivis la jarojn.

Baze la vortaro konsistas el artikoloj en XML sekvante dokumenttipdifinon (DTD) kaj tradukitaj al la fina vortaro kun ĉiuj indeksoj per XSL-transformoj. La kadron por apliki la transformojn donas Formiko (`Ant`).

Jen superrigardo pri la precipaj subprojektoj:
- Grundo - la komunaj dosieroj (agordo, dokumentoj, listoj, transformoj kc)
- Araneo - la retservo inkl. de simpla redaktilo por Revo, baziĝas sur `Apache httpd`
- Abelo - la datumbazo kaj serĉilo, baziĝas sur `mySQL` + Perloskriptoj
- Tomocero - la retpoŝtilo, baziĝas sur `Postfix`
- Afido - la akceptilo de la redaktoservo, baziĝas sur Perloskriptoj, `jq`, `git` kc
- Formiko - la transformilo, baziĝas sur `Apache Ant` + `Java`
- Cetonio - la komforta redaktilo, baziĝas sur `SWI-Prolog` kaj `jQuery UI`
- Cikado - citaĵoservo / tekstserĉilo, baziĝas sur `SWI-Prolog`
- Akrido - la vortanalizilo, baziĝas sur `SWI-Prolog` 
- Grilo - la sintakskontrolilo laŭ RelaxNG baziĝas sur `Java` + `Jing-Trang`

Tiu ĉi pakaĵo ne provizas apartan servon aŭ aplikaĵon, sed nur komunaĵojn. Tamen vi trovos en ĝi `Dockerfile`, kiu helpas antaŭkompili aferojn kiel piktogramojn, stilojn kaj Javoskriptojn, sen ke vi devos mem instali unue `metapost`, `cssmin` kaj `google-closure-compiler`. Tion transprenas `docker build` laŭ la instrukcioj en `Dockerfile`. Tiu parto de kompilado, kiu okazas per Javaskriptaj iloj el `nodjs` okazas per `npm` laŭ la instrukcioj en `package.json`.

Pli detale vi trovas la sekvajn rimedojn:

1. DTD - la dokumenttipdifinoj, kiu specifan la strukturon de validaj Revo-artikoloj kaj provizas ankaŭ 
alinomojn por literoj, libroj de la biblio ks.

1. BIN - multaj skriptoj, parte Ŝelskriptoj (.sh), parte Perloskriptoj (.pl). Kelkaj aĝas jam 20 jarojn kaj apenaŭ estas plu uzataj, kelkaj estas novaj. Novajn ni skribas precipe kiel Ŝelskriptoj. Mi iom hezitas forĵeti malnovajn skriptojn, ĉar foje dum kvin jaroj ili plu utilas aŭ dokumentas, kiel io estis origine farita, tiel helpante rememorigi kaj rekompreni ion. Eble mi ŝovu ilin al aparta dosierujo.

1. XSL - la transformskriptoj por aktualigi redaktitajn artikolojn kaj indeksojn. Ili estas uzataj en la transformilo de la redaktoservo (`voko-formiko`) kaj ankaŭ en ambaŭ redaktiloj por provizi antaŭrigardon.

1. CFG - agordoj, precipe listoj de lingvoj, fakoj, alfabetoj, kategorioj ktp. Ni uzas ilin kaj en la transformado kaj redaktado. (Agordoj, kiuj rekte rilatas la enhavon de Revo, t.e. aranĝo de ĉefa indekso kaj bibliografio, troviĝas en `revo-fonto`)

1. SMB - la piktogramoj de fakoj, referencoj kaj butonoj. La plej multaj intertempe estas verkitaj per geometriaj instrukcioj de `metapost`. Tiel ni povas ricevi samtempe el ili vektorajn (SVG) kaj rastrumajn (PNG) reprezentojn.

1. STL - la stiloj por prezenti Revon en la reto, uzataj en la fasado kaj antaŭrigardoj de la redaktiloj.

1. JSC - Javoskriptoj. Konsiderinda parto de ili estas nur uzata en la retservo (`voko-araneo`), sed transportiĝis origine tien tra `voko-formiko`. Verŝajne ili iam translokiĝos al `voko-araneo`.
Tamen iujn kiel `util.js` ni eble uzos en ambaŭ redaktiloj.

1. SQL - la skemo de la datumbazo `SQlite3`, kiun ni provizas en la ĉiutagaj eldonoj kaj uzas en la komforta redaktilo por serĉado, referencado ktp.

1. DOK - manlibroj kc. La plej multaj intertempe transiris al `revuloj.github.io` kaj estu plu felgataj tie. Restas tie ĉi ekz-e la dokumento Datumprotekto.

1. OWL - la kategoria sistemo de la kategoria indekso. Ni forigos tion post adapti ankoraŭ kelkajn lokojn kaj plu uzos nur `cfg/klasoj.xml`. RDF kaj OWL estus precipe utilaj uzante apartajn programojn por rezonado, sed post kelkaj jaroj da eksperimentado tio montriĝis ne sufiĉe utila por ĉiutaga uzo.
