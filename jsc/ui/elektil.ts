/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';

/**
 * Klaso por trakti elektilojn konsistantaj el komcernaj formularkampoj 'checkbox' aŭ 'radiobutton'
 */
export class Elektil extends UIElement {
    //valoroj: any;


    static kreu(spec: string, opcioj?: any) {
        document.querySelectorAll(spec).forEach((e) => {
            if (e instanceof HTMLInputElement)
                new Elektil(e,opcioj);
        });
    }

    static elektil(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Elektil) return e;
    }

    /*
    static refreŝigu(element: HTMLElement|string) {
        const e = Elektil.elektil(element);
        if (e) e.refreŝigu();
    }*/

    constructor(element: HTMLInputElement|string, opcioj?: any) {
        super(element, opcioj);
    }

    /*
    refreŝigu() {
        console.error("Elektil.refreŝigu: Ne jam implementita!");
    }*/

}