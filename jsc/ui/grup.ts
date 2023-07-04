/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';

export class Grup extends UIElement {
    //valoroj: any;

    static grup(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Grup) return e;
    }

    constructor(element: HTMLInputElement|string, opcioj?: any) {
        super(element, opcioj);
    }


}