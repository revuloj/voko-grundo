/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Skal extends UIElement {
    //valoroj: any;

    opcioj: { }

    static skal(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Skal) return e;
    }

    constructor(element: HTMLInputElement|string, opcioj?: any) {
        super(element, opcioj);
    }


}