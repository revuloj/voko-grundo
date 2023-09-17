/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */


export class Klavar {

    static aldonu(e: HTMLElement|string, klavo: string, reago: (e: KeyboardEvent)=>void) {

        const el = (typeof e === "string")? document.querySelector(e) : e;

        if (el instanceof HTMLElement) {
            if (el._voko_klavar) 
                el._voko_klavar.aldonu(klavo, reago)
            else {
                const klv = new Klavar(el);
                klv.aldonu(klavo, reago);
                el._voko_klavar = klv;
            }
        }  
    }

    public element;
    private _reagoj: { [key: string]: (e: KeyboardEvent)=>void };

    constructor(element: HTMLElement|string) {
        const el = (typeof element === "string")? document.querySelector(element) as HTMLElement : element;

        if (el) {
            this.element = el;
            el._voko_klavar = this;
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

