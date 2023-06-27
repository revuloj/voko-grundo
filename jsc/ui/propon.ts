/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Propon extends UIElement {
    //valoroj: any;

    opcioj: { }

    static propon(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Propon) return e;
    }

    constructor(element: HTMLInputElement|string, opcioj?: any) {
        super(element, opcioj);
    }

    proponu() {
        // ni devos legi la enhavon (aŭ lastan vorton?) de la
        // elemento kaj uzi la koncernajn rimedojn (listo, serĉ-funkcio)
        // por trovi aron da proponoj...

        throw "Menu.proponu: Ne jam implementita!"
    }
}