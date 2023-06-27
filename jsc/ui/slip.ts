/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Slip extends UIElement {
    //valoroj: any;

    opcioj: { 
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
    }

    /**
     * Redonas la langetojn, supozante ke ili estas li-elementoj ene de ul aŭ ol
     */
    langetoj() {
        const l = this.element.querySelector("ul,ol");
        if (l) return l.querySelectorAll("li");
    }

}    