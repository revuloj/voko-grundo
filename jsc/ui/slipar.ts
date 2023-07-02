/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Slipar extends UIElement {
    //valoroj: any;

    static _default: { 
        aktiva: number;
        poste: undefined;
        antaŭe: undefined;
    };

    static slipar(element: HTMLDialogElement|string) {
        let s = super.obj(element);
        if (s instanceof Slipar) return s;
    }

    static montru(element: HTMLDialogElement|string, akt: number) {
        const s = Slipar.slipar(element);
        if (s) s.montru(akt);
    }

    constructor(element: HTMLDialogElement|string, opcioj: any) {
        super(element, opcioj);

        this.opcioj = Object.assign(this.opcioj,Slipar._default,opcioj)

        // kaŝu ĉiujn krom la aktiva
        if (this.opcioj.aktiva == undefined) this.opcioj.aktiva = 0;
        let n = 0;
        const aktiva = this.opcioj.aktiva;

        this.opcioj.aktiva = 0;
        this._videbleco(this.langetoj()?.item(0));


        this.langetoj()?.forEach((l) => {   
            // kreu reagon
            l.addEventListener("click",() => this._lelekto.call(this,l));
        });
    }

    _videbleco(langeto) {
        const sl0 = this.slipo(langeto);
        this.langetoj()?.forEach((l) => {
            const sl = this.slipo(l);
            if (sl) DOM.kaŝu(sl,(sl0 !== sl));
        });
    }

    _lslip_id(langeto) {
        const href = langeto.querySelector("a[href]")?.getAttribute("href");
        if (href) {
            return href.split('#')[1];  
        }
    }

    _lelekto(langeto) {
        const lgoj = this.langetoj();
        if (lgoj) {
            const n = Array.from(lgoj).indexOf(langeto);
            this.montru(n);
        }
    }

    montru(akt: number) {
        const ln_malnov = this.langetoj()?.item(this.opcioj.aktiva);
        const sl_malnov = ln_malnov? this.slipo(ln_malnov) : undefined;
        const ln_nov = this.langetoj()?.item(akt);
        const sl_nov = ln_nov? this.slipo(ln_nov) : undefined;

        if (ln_nov !== ln_malnov && sl_malnov && sl_nov) {
            let ŝanĝu = true;

            if (this.opcioj.antaŭe instanceof Function) {
                //ŝanĝu = 
                this.opcioj.antaŭe.call(this,
                {
                    slipo_malnova: sl_malnov,
                    slipo_nova: sl_nov,
                    langeto_malnova: ln_malnov,
                    langeto_nova: ln_nov
                });
            };

            if (ŝanĝu) {
                this.opcioj.aktiva = akt;
                this._videbleco(ln_nov);

                if (this.opcioj.poste instanceof Function) {
                    ŝanĝu = this.opcioj.poste.call(this,
                    {
                        slipo_malnova: sl_malnov,
                        slipo_nova: sl_nov,
                        langeto_malnova: ln_malnov,
                        langeto_nova: ln_nov
                    });
                };
        
            }
    
        }
    }

    /**
     * Redonas la langetojn, supozante ke ili estas li-elementoj ene de ul aŭ ol
     */
    langetoj(): NodeListOf<HTMLLIElement>|undefined {
        const l = this.element.querySelector("ul,ol");
        if (l) return l.querySelectorAll("li");
    }

    /**
     * Redonas la slipon, kiu apartenas al la donita langeto
     * @param 
     */
    slipo(langeto: HTMLElement) {
        const sl_id = this._lslip_id(langeto);
        return document.getElementById(sl_id);
    }

}    