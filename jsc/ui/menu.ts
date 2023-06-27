/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Menu extends UIElement {
    //valoroj: any;

    opcioj: { }

    static menu(element: HTMLElement|string) {
        const m = super.obj(element);
        if (m instanceof Menu) return m;
    }

    static refreŝigu(element: HTMLElement|string) {
        const m = Menu.menu(element);
        if (m) m.refreŝigu();
    }

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element, opcioj);
    }

    refreŝigu() {
        throw "Menu.refreŝigu: Ne jam implementita!"
    }
}