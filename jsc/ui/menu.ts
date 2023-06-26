/**
 * (c) 2023 ĉ€ Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Menu extends UIElement {
    //valoroj: any;

    opcioj: { }

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element, opcioj);
    }
}