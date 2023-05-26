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

1. JSC - Javoskriptoj. Ili estas uzataj por la fasado de Reta Vortaro retservo (`voko-araneo`) kaj la aparta redaktilo Cetonio  (`voko-cetonio`). Vi povas krei dokumentajn paĝojn en `jsdoc/` per la komando `npm run doc`.

1. SQL - la skemo de la datumbazo `SQlite3`, kiun ni provizas en la ĉiutagaj eldonoj kaj uzas en la komforta redaktilo por serĉado, referencado ktp.

1. DOK - manlibroj kc. La plej multaj intertempe transiris al `revuloj.github.io` kaj estu plu felgataj tie. Restas tie ĉi ekz-e la dokumento Datumprotekto.

1. OWL - la kategoria sistemo de la kategoria indekso. Ni forigos tion post adapti ankoraŭ kelkajn lokojn kaj plu uzos nur `cfg/klasoj.xml`. RDF kaj OWL estus precipe utilaj uzante apartajn programojn por rezonado, sed post kelkaj jaroj da eksperimentado tio montriĝis ne sufiĉe utila por ĉiutaga uzo.


## Kiel krei novan eldonon

La centraj dosieroj el voko-grundo (agordo, DTD, XSL, vinjetoj) estas uzataj de pluraj aliaj subprojektoj kaj ties procezujoj, aparte: voko-formiko (la redaktoservo), voko-araneo (la vortara retpaĝaro), voko-cetonio (la komforta redaktilo). Eldonoj de tiuj povas referenci al certa eldono de voko-grundo (precipe en ties Dockerfile).
Kelkaj uzas nur la kunpakitan font-arĥivon de voko-grundo, kelkaj la procezujon ĉar ili bezonas ankaŭ kompilaĵon (CSS, JS, vinjetoj).

Helpas la skripto `bin/eldono` kaj `bin/deplojo` por organizi la novan eldonon. Eldono kreiĝas en sia aparta git-branĉo, kiun vi kreas komence. Eldonojn ni nomas cifero+litero, ekzemple `2f`, sed malsupre montras per ĵokero `<ELD>`. La eldonnumero aperas en pluraj fontdosiero. La eldono por la pakaĵo `nodejs` tamen toleras nur ciferojn,
do ni tradukas la literon al cifero en la tria pozicio: `2f` => `2.0.6`. 
La celo `preparo` poste aŭtomate aktualigas ilin en la fontodosieroj.

Jen konciza paŝaro:

1. Prepari novan eldonon en aparta git-branĉo

Krei novan branĉon:
```
git checkout -b <ELD>
```

Prepari la eldonon, skribante la nomon supre en la helpskriptojn:
```
vi bin/eldono
release=<ELD>
node_release=<ELDn>

vi bin/deplojo
release=<ELD>
node_release=<ELDn>
```

Aktualigu la novan eldonnumeron en diversajn fontdosierojn:

```
bin/eldono preparo
```

2. Fari kaj konservi ŝanĝojn por la nova eldono

Faru ĉiujn bezonatajn ŝanĝojn en la kodo. Kompletan novan procezujon `voko-grundo` vi povas krei loke per:

```
bin/eldono kreo
```

Kutime vi volas nur kompili kaj elprovi novan JS/CSS k.s. vi uzos por tio la diversajn celojn en `package.json`, ekz-e:

```
npm run build
npm run build:js:debug
```

La skripto `bin/deplojo.sh` helpas rekompili kaj kopii la rezulton al loka procezujo 
(vd. `revo-medioj/araneujo` kaj `revo-medioj/cetoniujo` k.a.) 
Por povi tuj elprovi ŝanĝojn loke, enrigardu tiun skripton por pliaj detaloj.
```
bin/deplojo araneo:debug
bin/deplojo cetonio:debug
```

Por sendi viajn ŝanĝojn al la centra deponejo,
konfirmu kaj puŝu viajn ŝanĝojn:
```
git add <dosieroj>
git commit -m"<kion vi ŝanĝis>"
git push --set-upstream origin <ELD>
```

3. Marki la eldonon per etikedo (git tag)

Donu aŭ ŝovu etikedon `<ELD>` al la nuna stato de la kodo.
Tio puŝas la etikedon ankaŭ al github kaj tie kreiĝas nova procezujo kun tiu etikedo (vd. ago-skripton sub `.github/workflows`)
```
bin/eldono etikedo
```

4. Integrigi la eldonon en la ĉefan branĉon

Fine, kiam vi ne plu faras ŝanĝojn en la eldono vi povas movi ĉion al la ĉefa branĉo, etikedi la eldonon tie kaj forigi la flankan branĉon:
```
git checkout master
git merge <ELD>
git tag v<ELD>
git push --tags
git -d <ELD>
git push --delete origin <ELD>
```

5. Uzi la procezujon kun projektoj voko-araneo kaj voko-cetonio

La retservo voko-areno kaj la redaktilo voko-cetonio baziĝas sur la kompilita enhavo de voko-grundo.
Por ke ili povu atingi la enhavon ili elŝutas la procezujon kutime de Github-pakaĵajo `ghcr`. Do vi devas unue krei eldono de voko-grundo kaj pusi la enhavon al Github. Tie la skripto `.github/workflows/docker-push.yml` aŭtomate kreas novan pakaĵon  kun la donita eldonnumero.

Alternative vi povas loke kompili per `bin/eldono kreo` kaj doni la kompletan nomon, kiun donus Github al la procezujo per `docker tag...`.

La du menciitaj projektoj havas saman eldon-skripton por krei akordan eldonnumeron. Por funkciigi ilin loke prefere uzu la konfigurojn el la projekto `revo-medioj`. Kiam la aplikaĵoj ekfunkcias loke, vi povas deploji ŝanĝojn, kiujn vi programis, ekz-e de JS, CSS, XSL al la kurantaj aplikaĵoj per la diversajn celoj troviĝantaj en la skripto `bin/deplojo`, ekz-e `bin/deplojo araneo:debug`.