/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

/**
 * Ebligas registri klavojn de fizika klavaro, kiujn ni traktas aparte en keydown-eventoj (klavprem-eventoj).
 * Tiel ni ekzemple povas registri traktilojn por TAB- kaj RETRO-klavoj por ĝuste respekti enŝovojn per spacsignoj,
 * la T-klavon ĉe XML-redaktilo, kiu, se aldone Ktrl- aŭ Alt-klavo estas premita aldonas traduk-elementon k.a.
 */

export class Klavar {
    // tenas la ligojn inter la koncernaj HTML-elementoj kaj la Klavar-objektoj
    static registro = new WeakMap();

    // ĉu uzi WeakMap anstataŭ el._voko_klavar?
    // vd https://stackoverflow.com/questions/4258466/can-i-add-arbitrary-properties-to-dom-objects
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap

    static aldonu(e: HTMLElement|string, klavo: string, reago: (e: KeyboardEvent)=>void) {

        const el = (typeof e === "string")? document.querySelector(e) : e;

        if (el instanceof HTMLElement) {
            const klv = Klavar.registro.get(el);
            if (klv) {
            /// if (el._voko_klavar) {
                /// const klv = el._voko_klavar;
                
                klv.aldonu(klavo, reago);
                // ŝajne ni devas remeti la ŝanĝitan objekton en DOM por ke la ŝanĝo persistu
                /// el._voko_klavar = klv;
            } else {
                const klv = new Klavar(el);
                klv.aldonu(klavo, reago);
                /// el._voko_klavar = klv;
                /// UIKlavRegistro.set(el,klv);
            }
        }
    }  
    

    public element;
    private _reagoj: { [key: string]: (e: KeyboardEvent)=>void };

    constructor(element: HTMLElement|string) {
        const el = (typeof element === "string")? document.querySelector(element) as HTMLElement : element;

        if (el) {
            this.element = el;
            /// el._voko_klavar = this;
            Klavar.registro.set(el,this);
            this._reagoj = {};
            this.element.addEventListener("keydown",this._keydown.bind(this));
        }
    };

    aldonu(klavo: string, reago: (e: KeyboardEvent)=>void) {
        // aldonu reagon
        this._reagoj[klavo] = reago;        
    }

    _keydown(event: KeyboardEvent) {
        const code = event.code;
        const r = this._reagoj[code];
        if (r) r(event);
    }
};

