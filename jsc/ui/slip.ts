/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Slip extends UIElement {
    //valoroj: any;

    static _default: { 
        aktiva: number;
    };

    static slip(element: HTMLDialogElement|string) {
        let s = super.obj(element);
        if (s instanceof Slip) return s;
    }

    static montru(element: HTMLDialogElement|string, akt: number) {
        const s = Slip.slip(element);
        if (s) s.montru(akt);
    }

    constructor(element: HTMLDialogElement|string, opcioj: any) {
        super(element, opcioj);

        this.opcioj = Object.assign(this.opcioj,Slip._default,opcioj)

        // kaŝu ĉiujn krom la aktiva
        if (this.opcioj.aktiva == undefined) this.opcioj.aktiva = 0;
        let n = 0;
        const aktiva = this.opcioj.aktiva;

        this.montru(aktiva);

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
        this.opcioj.aktiva = akt;
        const ln = this.langetoj()?.item(akt);

        this._videbleco(ln);
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