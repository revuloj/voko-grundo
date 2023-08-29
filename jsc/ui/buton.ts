/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';

export class Buton extends UIElement {

    static buton(element: HTMLInputElement|string): Buton|undefined {
        const e = super.obj(element);
        if (e instanceof Buton) return e;
    }

    static aktiva(element: HTMLInputElement|string, akt: boolean) {
        const b = Buton.buton(element);
        if (b) b.aktiva(akt);
    }

    constructor(element: HTMLInputElement|string, opcioj?: any) {
        super(element, opcioj);
    }

    aktiva(akt: boolean) {
        (this.element as HTMLInputElement).disabled = ! akt;
    }
}