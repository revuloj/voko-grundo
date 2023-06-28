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

    static montru(element: HTMLDialogElement|string, n: number) {
        const s = Slip.slip(element);
        if (s) s.opcioj.aktiva = n;
    }

    constructor(element: HTMLDialogElement|string, opcioj: any) {
        super(element, opcioj);

        this.opcioj = Object.assign(this.opcioj,Slip._default,opcioj)

        // kaŝu ĉiujn krom la aktiva
        if (this.opcioj.aktiva == undefined) this.opcioj.aktiva = 0;
        let n = 0;
        const aktiva = this.opcioj.aktiva;

        this.langetoj()?.forEach((l) => {   
            const s = this.slipo(l);
            if (s) {
                DOM.kaŝu(s, n!= aktiva); // alternative ni povus memori la valoron de CSS display kaj poste ŝalti al "display:none"
                n++;
            }
        })
    }

    /**
     * Redonas la langetojn, supozante ke ili estas li-elementoj ene de ul aŭ ol
     */
    langetoj(): NodeListOf<HTMLLIElement>|undefined {
        const l = this.element.querySelector("ul,ol");
        if (l) return l.querySelectorAll("li");
    }

    /**
     * Redonas la slipon, kiu apartenas al la donia langeto
     * @param 
     */
    slipo(l: HTMLElement) {
        const href = l.querySelector("a[href]")?.getAttribute("href");
        if (href) {
            const hash = href.split('#')[1];
            return document.getElementById(hash);
        }
    }

}    