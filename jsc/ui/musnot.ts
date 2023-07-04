/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';

export class Musnot extends UIElement {
    //valoroj: any;

    static musnot(element: HTMLElement|Document|string) {
        const e = (element instanceof Document)? super.obj(element.body) : super.obj(element);
        if (e instanceof Musnot) return e;
    }

    constructor(element: HTMLElement|Document|string, opcioj?: any) {
        if (element instanceof Document) super(element.body, opcioj)
        else super(element, opcioj);
        console.error("Musnotoj ankoraŭ ne implementita!");
    }


}