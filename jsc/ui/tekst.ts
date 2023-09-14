/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';


export type TPozicio = {
    lin: number,
    poz: number
}

export interface TId {
    id: string
};

export interface Tekstero { 
    id: string, // unika identigilo de la tekstero, ĝi ne dependu de la pozicio de la tekstero en
                // la teksto tiel, ke ĝi ne perdas validecon ĉe ŝovo de la tekstero.
    no: number, // la numero de la subteksto en la listo (subteksteroj enordiĝas, t.e 1.a ricevos numeron 2)
    de: number, // komenca signo de la tekstero, rilate al la tuta teksto
    al: number, // fina signo de la tekstero, rilate al la tuta teksto (do longeo estas de-al)
    ln: number, // la komenca linio ene de la tuta teksto
    lc?: number // la nombro de linioj
};

/**
 * Klaso por trakti strukturitan tekston, aparte por redakti ties unuopan parton
 * aparte. Ne necesas, ke la partoj sekvas unu la aliajn, eblas ankaŭ ingigitaj subtekstoj,
 * t.e. arba strukturo anstataŭ listo. Tamen la partoj estas administrataj interne kiel
 * listo. La komencaj kaj finaj signonumeroj rilate al la komenco de la tuta teksto
 * identigas la unuopajn partojn. Necesas do kohera sinkronigado inter redaktilo kaj
 * la tekststrukturo por ne fusi la enhavon!
 */
export class Tekst extends UIElement {
    static kmp_eo = new Intl.Collator('eo').compare;
    private _partoj: Array<Tekstero>;
    private _teksto: string;
    public sinkrona: boolean;

    static aprioraj = { };

    static kreu(spec: string, opcioj?: any) {
        document.querySelectorAll(spec).forEach((e) => {
            if (e instanceof HTMLElement)
                new Tekst(e,opcioj);
        });
    }

    static tekst(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Tekst) return e;
    }

    constructor(element: HTMLElement|string, opcioj?: any, aprioraj = Tekst.aprioraj) {
        super(element, opcioj, aprioraj);
    
        this._teksto = '';
        this._partoj = [];

        this.element.addEventListener("input",() => { this.sinkrona = false; });
        this.element.addEventListener("change",() => { this.sinkrona = false; });
    }

    /**
     * Metas la tutan tekston, poste renovigas la strukturinformojn.
     */
    set teksto(teksto: string) {
        this._teksto = teksto;
        this.strukturo();
    }


    /**
     * Redonas la tutan XML-tekston post eventuala sinkronigo kun la aktuala redakto
     * @returns la tuta sinkronigita teksto
     */
    get teksto(): string {
        if (! this.sinkrona) this.sinkronigu(this.elekto); 
        return this.teksto;
    };
  

    /**
     * Aktualigas la tekstbufron per la redaktata subteksto, ankaŭ aktualigas la struktur-liston
     * @param select - se donita, la strukturelemento kun 
     * tiu .id estos poste la elektita, se ĝi aldone havas .ln, .el tiuj povus esti
     * uzataj por retrovi subtekston, kies .id ŝanĝiĝis, ekz-e pro aldono/ŝanĝo
     */
    sinkronigu(select?: TId) {
        if (this.elekto) {
            console.debug("<<< sinkronigo <<<");
            // try {
            //   console.debug(new Error().stack.split("\n")[2]);
            // } catch(e) { };

            const old_s = this.elekto;    
            const nstru = this._partoj.length;

            if (!select) select = this.elekto;

            // unue ni legas la aktuale redaktatan subtekston kaj enŝovas en la kompletan
            // tio ankaŭ rekreas la strukturon de subtekstoj!
            // ni memoras la longecon de la nova subteksto, ĉar se ĝi entenas pli ol la ĉefan elementon, ekz-e finan
            // komenton, ni devas evit duobliĝon per aktualigo ankaŭ de la montrata subteksto
            const teksto =  this.element.value;
            const ln = teksto.length;
            this.anstataŭigu(this.elekto,teksto,select.id);

            // nun retrovu la elektendan subtekston en la rekreita strukturo

            // trovu laŭ id (tbs = to be selected)
            let tbs = this.subtekst_info(select.id);

            if (tbs) {
                this.elekto = tbs;
            // se ni ne trovis la subtekston per sia id, sed ĝi estas la
            // sama, kiun ni ĵus redaktis, eble la marko ŝanĝiĝis
            // aŭ aldoniĝis snc/drv, ni provu trovi do per .ln kaj .el
            } else if (select.id == old_s.id) {
                tbs = this.xmlstruct.findStruct(select);
                if (tbs) this.elekto = tbs;
            };
            
            // se tute ne retrovita, ni elektas la unuan subtekston (art)
            if (!tbs) {
                this.elekto = this._partoj[0]; 
            }

            // se ni transiris al alia subteksto, aŭ aldoniĝis io post ĝi, aŭ eĉ tuta strukturero, 
            // ni devos ankoraŭ montri la novelektitan/ŝanĝitan subtekston en Textarea
            if (old_s.id != this.elekto.id 
                || old_s.ln != this.elekto.ln
                || ln != (this.elekto.al - this.elekto.de)
                || old_s.el != this.elekto.el

                || nstru != this._partoj.length) {
                // nun ni montras la celatan XML-parton por redaktado
                this.element.value = this.subteksto(this.elekto);
            }

            this.sinkrona = true;
        }
    };

    /**
     * Kreas novan strukturon. Ĉar ni ne scias, laŭ kiu sintakso la strukturo
     * kreigu tion devas fari la uzanta objekto, kiu tiucele transdonu en opcioj
     * funkcion strukturo()
     */
    strukturo() {
        this._partoj = [];
        if (this.opcioj.strukturo instanceof Function)
            this.opcioj.strukturo(this);
    }


    /**
     * Elektas (alian) subtekston de la teksto por redakti nur tiun.
     * Laŭbezone sekurigas la nune redaktatan parton...
     * @param id - la identigilo de la subteksto
     */
    ekredaktu(id: string, sinkronigu = true) {
        if (id) {
            console.debug("<<< ŝanĝu subtekston "+id+" <<<");

            // ni unue sekurigu la aktuale redaktatan parton...
            if (sinkronigu) this.sinkronigu({id:id}); // ni transdonas ankaŭ la elektotan id por navigi tien en la elekto-listo
            
            /* ni trovu la celatan subtekston per ĝia id... */

            // apriore, por la kazo, ke ni ne trovos la celatan, ekz-e ĉar marko aŭ enhavo snc-aldono...) ŝanĝiĝis,
            // ni antaŭelektas al la unuan (art)
            this.elekto = this._partoj[0]; 
                // ni montro simple la unua subtekston, t.e. la artikolon
            
            // nun serĉu...
            const tbs = this.subtekst_info(id);
            if (tbs) {
                this.elekto = tbs;
            }

            // komparu kun SYNC...
            //console.debug("CHNG "+this.xml_elekto.id+": "+this.xml_elekto.de+"-"+this.xml_elekto.al
            //  +"("+(this.xml_elekto.al-this.xml_elekto.de)+")");

            // nun ni montras la celatan XML-parton por redaktado
            this.element.value = this.subteksto(this.elekto);
            // iru al la komenco!
            this.kursoro_supren();
            this.scrollPos(0);

            if (this.onselectsub) this.onselectsub(this.elekto);
        }
    };

    /**
     * Aldonas teksteron al la fino de la parto-listo. Ni aŭtomate metas/aktualigas ĝian numeron
     * @param ero  aldona objekto kun la atributoj de la strukturero
     */
    aldonu(ero: Tekstero) {
        ero.no = this._partoj.length;
        this._partoj.push(ero);

        // evtl. reago al aldono
        if (this.opcioj.post_aldono instanceof Function)
            this.opcioj.post_aldono(ero);
    }

    /**
     * Forigas ĉiujn strukturinformojn.
     */
    purigu() {
        this._partoj = [];
    }

    /**
     * 
     * @param id Redonas la informojn pri subteksto, identigitan per sia id
     * @returns 
     */
    subtekst_info(id: string): Tekstero|undefined {
        return this._partoj.find((e) => e.id == id);
    }


    /**
     * Trovas subtekston en la strukturlisto
     * @param sd - objekto kun .id kaj eventuala pliaj informoj .ln, .el por identigi la subtekston
     * @returns la konernan XML-tekston
     */
    subteksto(sd: TId): string {
        const s = this.subtekst_info(sd.id);
        if (s) return this.teksto.slice(s.de,s.al);
        else throw "Nevalida tekstero '"+sd.id+"'";
    };


    /**
     * Trovos la patran subtekston de la struktur-elemento donita, t.e. kiu
     * entenas ĝin
     * @param sd - objekto kun .id kaj eventuale pliaj informoj .ln, .el por identigi la subtekston
     * @returns la detalojn de la patro kiel objekto
     */
    patro(sd: TId): Tekstero|undefined {
        const s = this.subtekst_info(sd.id);

        // patro venas antaŭ la nuna kaj enhavas ĝin (subteksto al..de)
        if (s) {
            for (var n = s.no-1; n>=0; n--) {
                const p = this._partoj[n];
                if (p.de < s.de && p.al > s.al ) return p;  
            }        
        } else throw "Nevalida tekstero '"+sd.id+"'";
    };



   /* Anstataŭigas donitan subtekston per nova
    * @param sd - la anstataŭigenda subteksto
    * @param xml - la nova subteksto
    * @param select - se donita, la strukturelemento kun tiu .id estos poste la elektita
    */
    anstataŭigu(sd: Tekstero, teksto: string) {   
       const elekto = this.subtekst_info(sd.id);
 
       if (elekto) {
        this.teksto = 
            (this.teksto.substring(0,elekto.de) 
            + teksto
            + this.teksto.substring(elekto.al));
       } else
        throw "Nevalida tekstero '"+sd.id+"'";
    };

    /**
    * Enŝovas novan subtekston post la subtekston kun 's_id'
    * Ĝi atentas, ke rekte post tiu povas okazi sub-subtekstoj,
    * kiujn ni devas transsalti por trovi la ĝustan lokon.
    */
    enŝovu_post(s_id: string, xml: string) {
        // trovu la subtekston laŭ mrk
        const s = this.subteksto(s_id);
        if (!s) throw "Subteksto kun id "+s_id+" ne trovita!"

        // enŝovu la novan subtekston post tiu, uzante la pozicion s.al
        this.teksto = 
            this.teksto.substring(0,s.al) 
            + "\n"+ xml 
            + this.teksto.substring(s.al);
    }


    /**
     * Iras al pozicio indikita per "<line>:[<lpos>]"
     * @param line_pos - linio kaj eventuala pozicio en la linio kiel teksto
     * @param len - se donita, tiom da signoj ĉe la indikita poizico estos markitaj,
     *                  se ne donita unu signo estos elektita
     */
    iru_al(line_pos: string, len:number = 1) {
        //const re_line = this.re_stru._line;
        
        // kalkulu la signoindekson por certa linio
        function pos_of_line(txt: string, line: number): number {
            let pos = 0;
            let lin = 0;

            while (lin < line) {
                pos = txt.indexOf('\n',pos)+1;
                lin++;
            }
            /*
            var lines = this.element.val().split('\n');
            var pos = 0;
            
            for (var i=0; i<line; i++) {
                pos += lines[i].length+1;
            }*/
            return pos;
        };

        const p = line_pos.split(":");
        const line = +p[0] || 1;
        const lpos = +p[1] || 1;

        if (! this.sinkrona) this.sinkronigu(this.elekto); 
        const sub = this.getLastStructWithLine(line);

        const xml = this.subteksto(sub);
        const pos = pos_of_line(xml,line-sub.ln-1) + ( lpos>0 ? lpos-1 : 0 );

        this.ekredaktu(sub.id,true);
        this.select(pos,0); // rulu al la pozicio
        this.select(pos,len); // nur nun marku <len> signojn por pli bona videbleco
    };


    /**
     * Redonas la aktualan pozicion de la kursoro kiel linio kaj loko ene de la linio 
     * @returns objekto {{lin: number, poz: number}}
     */
    pozicio() {
        const loff = this.elekto? this.elekto.ln : 0;

        // kalkulu el la signoindekso la linion kaj la pozicion ene de la linio
        function get_line_pos(inx: number, text: string): TPozicio {
            var lines = 0;
            var last_pos = 0;
            for (let i=0; i<inx; i++) { 
                if (text[i] == '\n') {
                    lines++;
                    last_pos = i;
                }
            }
            pos = (lines == 0)? inx : (inx-last_pos-1);
            return({ lin: loff+lines, poz: pos });
        }

        //...
        let pos: number;
        let txtarea: HTMLInputElement = this.element;
        if('selectionStart' in txtarea) {
            pos = txtarea.selectionStart;
            return get_line_pos(pos, txtarea.value);
        } else 
            throw "Malnovaj retumiloj kiel IE ne plu subtenataj!"
    };


    /**
     * Redonas pozicion de kursoro kiel n-ro de signo
     * @returns - la numero de la signo, kie staras la kursoro
     */
    signo(): number {
        const txtarea = this.element;
        let pos = 0;
        if('selectionStart' in txtarea) {
            return txtarea.selectionStart;
        } else 
        throw "Malnovaj retumiloj kiel IE ne plu subtenataj!"
    };


    /**
     * Elektas tekstoparton en la redaktata teksto
     * @param poz - la pozicio ekde kie elekti
     * @param ln - la nombro de elektendaj signoj
     */
    elektu(pos: number, len: number = 0) {
        const txtarea = this.element;

        // ne plu bezonata por aktualaj retumiloj
        // if (document.selection && document.selection.createRange) { // IE/Opera
        //  range = document.selection.createRange();
        //  range.setStart(...);
        //  range.setEnd(...);
        //  range.select();   
        //} else {
        txtarea.selectionStart = pos;
        txtarea.selectionEnd = pos + len;
        //}

        // necesas ruli al la ĝusta linio ankoraŭ, por ke ĝi estu videbla
        const text = txtarea.value;
        const scroll_to_line = Math.max(get_line_pos(poz,text).line - 5, 0);
        const last_line = get_line_pos(text.length-1,text).line;
        this.scrollPos(txtarea.scrollHeight * scroll_to_line / last_line);  
    };


    /**
     * Legas aŭ anstataŭigas la momente elektitan tekston en la redaktata teksto
     * @param insertion - se donita la enmetenda teksto (ĉe la aktuala pozicio aŭ anstataŭ la aktuala elekto)
     * @param p_kursoro - se negativa tiom da signoj ni moviĝas antaŭen antaŭ enmeti la tekston, se pozitiva, tiom da signoj ni movas antaŭen la kursoron post enmeto (ekz-e tekstenŝovo)
     * @returns la momente elektita teksto, se ne estas donita enmetenda teksto
     */
    set elekto(insertion: string, p_kursoro: number = 0): string {
        //var txtarea = document.getElementById('r:xmltxt');
        const txtarea = this.txtarea;
        let startPos: number;
        txtarea.focus();

        // enmetu tekston ĉe la markita loko
        startPos = txtarea.selectionStart;
        if (p_kursoro < 0) startPos += p_kursoro; // -1: anstataŭigo kun x-klavo forigu la antaŭan literon!
        txtarea.value = 
            txtarea.value.substring(0, startPos) +
            insertion +
            txtarea.value.substring(txtarea.selectionEnd, txtarea.value.length);
        if (p_kursoro > 0) { // ni antaŭe havis > -1, sed tio ne funkciis por enŝovoj per spacoj
            // movu la kursoron al startPost+p_kursoro, por
            // ekz-e transsalti tekstenŝovon post enmetita snc/ekz/ref
            // vd. redaktilo.insert_xml
            txtarea.selectionStart = startPos + p_kursoro; 
            txtarea.selectionEnd = txtarea.selectionStart;
        } else {
            // movu la kursoron post la aldonita teksto
            txtarea.selectionStart = startPos + insertion.length;
            txtarea.selectionEnd = txtarea.selectionStart;
        }

        // ni ŝangis la tekston, sed la evento "input" ne en ciu retumilo lanciĝas
        // se la klavaro ne estas tuŝita...:
        this.sinkrona = false;
    }

    /**
     * Redoas la momente elktitan tekston
     */
    get elekto(): string {
        const txtarea = this.element
        startPos = txtarea.selectionStart;
        var endPos = txtarea.selectionEnd;
        return txtara.value.substring(startPos, endPos);         
    }


    /**
     * Ŝovas la markitan tekston 'indent' signojn dekstren aŭ maldekstren
     * sen argumento 'indent' ĝi eltrovas la enŝovon en la aktuala linio
     * @param ind - la nombro de ŝovendaj spacoj
     * @returns la enŝovo de la aktuala linio (la spacsignoj en ties komenco)
     */
    enŝovo(ind?: number): string {
        //var txtarea = document.getElementById('r:xmltxt');
        let txtarea = this.element;
        let selText: string;
        let startPos: number;

        if (typeof ind == "number") { // enŝovu
        txtarea.focus();
        // uzu get_indent / indent el tekstiloj
        const i_ = get_indent(txtarea).length;
        if (i_ % 2 == 1) ind = ind/2; // ŝovu nur ±1 (±2/2) ĉe momente nepara enŝovo!
        indent(txtarea,ind);
        // ni ŝangis la tekston, sed la evento "input" ne en ciu retumilo lanciĝas
        // se la klavaro ne estas tuŝita...:
        this.sinkrona = false;

        } else { // eltrovu la nunan enŝovon
        ind = 0;
        let linestart: number;

        /*
        if (document.selection  && document.selection.createRange) { // IE/Opera
            var range = document.selection.createRange();
            range.moveStart('character', - 200); 
            selText = range.text;
            linestart = selText.lastIndexOf("\n");
            while (selText.charCodeAt(linestart+1+ind) == 32) {ind++;}
        } else*/
        if (txtarea.selectionStart || txtarea.selectionStart === 0) { // Mozilla/Chrome
            startPos = txtarea.selectionStart;
            linestart = txtarea.value.substring(0, startPos).lastIndexOf("\n");
            while (txtarea.value.substring(0, startPos).charCodeAt(linestart+1+ind) == 32) {ind++;}
        }
        return (str_repeat(" ", ind));  
        }
    };


    /**
     * Signo antaŭ kursoro
     * @returns la signon antaŭ la kursoro
     */
    signo_antaŭ(): string {
        //var txtarea = document.getElementById('r:xmltxt');
        var txtarea = this.element;
        /*
        if (document.selection && document.selection.createRange) { // IE/Opera  
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart('character', - 1); 
        return range.text;
        } else {*/ // Mozilla/Chrome
        var startPos = txtarea.selectionStart;
        //txtarea.setSelectionRange(startPos-1,startPos);
        return txtarea.value.substring(startPos - 1, startPos);
        //}
    };

    /**
     * Eltrovu la signojn antaŭ la nuna pozicio (ĝis la linikomenco)
     */
    linisignoj_antaŭ(): string {
        const txtarea = this.element;
        const pos = this.positionNo();
        const val = txtarea.value;
        let p = pos;
        while (p>0 && val[p] != '\n') p--;
        return val.substring(p+1,pos);
    };


    /**
     * Metas la kursoron al la komenco de la redaktejo kaj fokusas ĝin
     */
    kursoro_supren() { 
        const txtarea = this.element;
        if (txtarea.setSelectionRange) { 
            txtarea.focus(); 
            //txtarea.setSelectionRange(0, 0); // problemo en Chrome?
            txtarea.selectionStart = 0;
            txtarea.selectionEnd = 0;
        } else 
        throw "Malnovaj retumiloj kiel IE ne plu subtenataj!"
        txtarea.focus();
    };

}