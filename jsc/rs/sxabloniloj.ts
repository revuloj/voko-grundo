
/*************************************************************************

// (c) 2017 - 2023 ĉe Wolfram Diestel
// laŭ GPL 2.0

*****************************************************************************/

import * as x from '../x';
import * as sbl from './sxablonoj';

/** ŝablonoj por flekseble enmeti referencojn, fontojn ktp. **/

export type Valoroj = { [key: string]: string };
export type Fonto = { value: string, bib: string, url: string, vrk: string, lok: string };

/**
 * Bazaj funkcioj de ŝablonoj
 */

class XMLŜablono {
    constructor(public sxablono: string) { };

    public _xml(args: Valoroj, indent = 0) {
        // args: Objekto kiu enhavas la anstataŭigendajn valorojn, kiuj aperas kiel {...} 
        // en la ŝablono, ekz {rad: "hom", fin: "o",...}
        const sx = this.sxablono.split("\n");
        let resultstr = '', ispaces='', 
            cond: string, str: string;

        for (let i=0; i<sx.length; i++) {
            const line = sx[i];
            const pos = line.indexOf(":");

            if (pos >= 0) {
                cond = line.slice(0,pos);
                str = line.slice(pos+1);
            } else {
                cond = '';
                str = line;
            }
            if (this.eval_condition(cond,args)) 
                    resultstr += this.eval_varstring(str,args) + "\n";
            
        }
        if (indent) {
            // var ispaces = new Array(indent+1).join(" ");
            ispaces = ' '.repeat(indent);
            resultstr = ispaces + (resultstr.replace(/\n/g,'\n'+ispaces)).trim();
        }
        return resultstr;   
    };

    private eval_condition(cond: string, args: Valoroj) {
        var c = cond.trim();
        if (c) {
            return new Function("return " + c.replace(/(\w+)/g,"this.$1")).call(args);
        }
        return true;
    };
                
    private eval_varstring(str: string, args: Valoroj) {
        return str.replace(/\{([a-z_]+)\}/g, function(_m,$1){ return args[$1]; } );
    }
};


/**
 * Krei novan artikolon surbaze de ŝablono
 */
export class XMLArtikolo extends XMLŜablono {
    
    constructor(public art: Valoroj) {
        super(sbl.xml_sxablonoj.art);
        art.dif = art.dif.replace(/~/g,'<tld/>');
    };   

    xml(indent?: number) {
        return super._xml(this.art, indent);
    };
};


/**
 * Krei novan derivaĵon surbaze de ŝablono 
 */
export class XMLDerivaĵo extends XMLŜablono {
    constructor(public drv: Valoroj) {
        super(sbl.xml_sxablonoj.drv);
        drv.dif = drv.dif.replace(/\n/g,"\n       ").replace(/~/g,'<tld/>');
        drv.mrk = x.alCx(drv.mrk + '.' + drv.kap.replace(/~/g,'0').replace(/ /g,'_'));
        drv.kap = drv.kap.replace(/~/g,'<tld/>');
    }; 

    xml(indent?: number) {
        return super._xml(this.drv, indent);
    };
}

/**
 * Krei novan sencon surbaze de ŝablono
 * @constructor
 */
export class XMLSenco extends XMLŜablono {
    constructor(public snc: { dif: string; drvmrk: string; mrk?: string}) {
        super(sbl.xml_sxablonoj.snc);
        snc.dif = snc.dif.replace(/\n/g,"\n       ").replace(/~/g,'<tld/>');
        snc.mrk = snc.drvmrk + '.' + snc.mrk;     
    }; 

    xml(indent = 2) {
        return super._xml(this.snc, indent);
    }
};


/**
 * Krei novan fonton surbaze de ŝablono
 */
export class XMLFonto extends XMLŜablono {
    constructor(public fnt: Valoroj) {
        super(sbl.xml_sxablonoj.fnt);
    };

    xml(indent?: number) {
        return super._xml(this.fnt,indent);
    }
};

/**
 * Krei novan ekzemplon surbaze de ŝablono
 */
export class XMLEkzemplo extends XMLŜablono {
    public fonto: XMLFonto;
    public frazo: string;

    constructor(ekz: Valoroj) {
        super(sbl.xml_sxablonoj.ekz);
        this.fonto = new XMLFonto(ekz);
        // anstataŭigu tildojn 
        ekz.frazo = ekz.frazo
            .replace(/~/g,'<tld/>');
        this.frazo = ekz.frazo;
    };

    xml(indent?: number) {
        let ekz = {fnt:this.fonto.xml(2).trim(), frazo:this.frazo};
        // se la frazo finiĝas per ! aŭ ?, ŝovu post </fnt>
        if (ekz.frazo.endsWith('!') || ekz.frazo.endsWith('?')) {
            const fsign = ekz.frazo.slice(-1);
            ekz.frazo = ekz.frazo.slice(0,-1);
            ekz.fnt = ekz.fnt.slice(0,-1) + fsign;
        }
        return super._xml(ekz, indent);
    };
}

/**
 * Krei novan referencon surbaze de ŝablono
 */
export class XMLReferenco extends XMLŜablono {

    constructor(public ref: Valoroj) {
        super(sbl.xml_sxablonoj.ref);
        if (ref.tip == 'nuda') { ref.tip = ''; }
    };

    xml(indent = 0) {
        return super._xml(this.ref,indent).replace(/\s+$/, '');
    };
}

/**
 * Krei novan referenc-grupon surbaze de ŝablono
 */

export class XMLReferencGrupo extends XMLŜablono {
    constructor(public ref: Valoroj) {
        super(sbl.xml_sxablonoj.refgrp);
        if (ref.tip == 'nuda') { ref.tip = ''; }
    };

    xml(indent = 4) {
    return super._xml(this.ref,indent);
    };
}


/**
 * Krei novan rimarkon surbaze de ŝablono
 */
export class XMLRimarko extends XMLŜablono {
    constructor(public rim: Valoroj, tip: any='rim') {
        super((tip=='rim'? sbl.xml_sxablonoj.rim : sbl.xml_sxablonoj.adm));
    };

    xml(indent?: number) {
        return super._xml(this.rim, indent);
    };
}


/**
 * Krei novan bildo-strukturon surbaze de ŝablono
 */
export class XMLBildo extends XMLŜablono {
    constructor(public bld: Valoroj) {
        super(sbl.xml_sxablonoj.bld);

        // https://upload.wikimedia.org/wikipedia/commons/6/61/Glaciar_del_Aneto_%283.404m%29.jpg
        // -> https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Glaciar_del_Aneto_%283.404m%29.jpg/640px-Glaciar_del_Aneto_%283.404m%29.jpg
        if (bld.url.startsWith('https://upload.wikimedia.org/wikipedia/commons/')) {
            var prefix_len = 'https://upload.wikimedia.org/wikipedia/commons/'.length;
            var parts = bld.url.split('/');
            var imgname = parts[parts.length -1];
            if (bld.url.endsWith('.svg')) {
                bld.url = '&WCU;/' + bld.url.slice(prefix_len);
            } else {
                bld.url = '&WCU;/thumb/' + bld.url.slice(prefix_len) + '/' + bld.lrg + 'px-' + imgname;
                bld.lrg = '';
            }
        }
        bld.fnt = bld.fnt.replace("https://commons.wikimedia.org/wiki","&WCW;"); 
        bld.frazo = bld.frazo.replace(/~/g,'<tld/>');
        bld.prm = bld.prm.replace(/public domain/i,'PD');
    };

    xml(indent?: number) {
        return super._xml(this.bld, indent);
    };
}

/**
 * Krei novan fonton (HTML ekz. en trov-listo) surbaze de ŝablono
 * @constructor
 * @param {*} bib_src
 */
export class HTMLFonto {
    public source: Array<Fonto>;
    private v: XMLŜablono;
    private b: XMLŜablono;
    private vt: XMLŜablono;
    private bt: XMLŜablono;

    constructor(bib_src: any) {
        this.source = bib_src;
        this.v = new XMLŜablono(sbl.html_sxablonoj.vrk);
        this.b = new XMLŜablono(sbl.html_sxablonoj.bib);
        this.vt = new XMLŜablono(sbl.html_sxablonoj.vrk_title);
        this.bt = new XMLŜablono(sbl.html_sxablonoj.bib_title);
    };

    bib_text(bib: any) {
        const verko = this.source.find((ero) => ero.bib == bib);
        return verko?.value;
    };
    
    html(fnt: Valoroj) {
        let _html = '';
        let bib = fnt.bib;

        let f: any = {
           vrk: this.v._xml(fnt).trim(),
           bib: this.b._xml(fnt).trim(),
           aut: fnt.aut,
           lok: fnt.lok
        };
    
        f.vrk = this.vt._xml(f).trim();
        if (bib) {
            f.bib_text = this.bib_text(bib);
            _html = this.bt._xml(f).trim();
        } else {
            _html = f.vrk;
        }

        return _html;
    }
};


/**
 * Krei novan trovon (DT-elemento ekz. en trov-listo) surbaze de ŝablono
 */
export class HTMLTrovoDt {
    private t: XMLŜablono;
    private tc: XMLŜablono;

    constructor() {
        this.t = new XMLŜablono(sbl.html_sxablonoj.dt_trovo); // sen URL
        this.tc = new XMLŜablono(sbl.html_sxablonoj.dt_trovo_cit); // kun URL
    };

    html(trv: Valoroj) {
        if (trv.title.includes(trv.url)) {
            return this.tc._xml(trv).trim();
        } else {
            return this.t._xml(trv).trim();
        }
    }
};

/**
 * Krei novan trovon (DD-bildo-elemento 
 * ekz. en trov-listo) surbaze de ŝablono 
 */
export class HTMLTrovoDdBld {
    private dd: XMLŜablono;

    constructor() {
        this.dd = new XMLŜablono(sbl.html_sxablonoj.dd_trovo_bld);
    };

    html(res: Valoroj) {
        return this.dd._xml(res).trim();
    }
};

/**
 * Listero de eraro- kaj avertolisto
 */
export class HTMLError {
    private li: XMLŜablono;

    constructor() {
        this.li = new XMLŜablono(sbl.html_sxablonoj.err_msg);
    };

    html(err: Valoroj) {
        return this.li._xml(err).trim();
    }
};


/**
 * Ŝablonoj elekteblaj kaj prilaboreblaj per menuo Ŝablonoj
 * @constructor
 */
export class SncŜablono {
    private sxablono: string;

    constructor(sxbl: string) {
        this.sxablono = sbl.snc_sxablonoj[sxbl];
    };

    form() {
        return x.quoteattr(this.sxablono).replace(/\{([osre]):([^\}]+)\}/g,
            this.form_element);
    };

    html() {
        var lines = this.form().split('\n');
        var html = '';
        for (let i=0; i<lines.length; i++) {
            html += '<tr><td><b class="sxbl">&ndash;</b></td><td><pre class="line">'+lines[i]+'</pre></td></tr>';
        }
        return html;
    };
    
    form_element(match: string, tipo: string, teksto:string, offset: number): string|undefined {
      var id = tipo + '_' + offset;
      var iid = 'i' + id;
      switch (tipo) {
          //case 'o': 
          //      return '<span class="sxbl" id="' + span_id + '">'+teksto+'</span><input type="checkbox" checked/>'; 
          //      break;
          case 's':
              var text_len = teksto.length;
              return '<span class="sxbl" id="' + id + '"><input type="text" size="' + 
                text_len + '" id="' + iid + '" value="' + teksto + '" /></span></input></span>';
          case 'r':
              return '<span class="sxbl" id="' + id + '">' + teksto + 
                '</span><button class="ui-button ui-corner-all">🔍︎</button>';
          case 'e':
              return '<span class="sxbl" id="' + id + '">' + teksto + 
                '</span><button class="ui-button ui-corner-all">🔍︎</button>';
      }    
    }
};

