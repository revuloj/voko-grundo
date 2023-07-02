/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Menu extends UIElement {
    //valoroj: any;
    static menu_item_class = "ui-menu-item";
    static menu_class = "ui-menu";
    static menu_sub_fermita_class = "ui-menu-sub-fermita";

    static _default: {
        eroj: "li",
        reago: undefined
     }

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

        this.opcioj = Object.assign(this.opcioj,Menu._default,opcioj);
        this.element.classList.add(Menu.menu_class);

        // preparu la menuerojn
        this._preparu();
    }

    _preparu() {
        this.element.querySelectorAll(this.opcioj.eroj).forEach((i) => {
            i.classList.add(Menu.menu_item_class);

            // traktu evtl. submenuon            
            const sub = i.querySelector("ul,ol");
            if (sub) {
                i.classList.add(Menu.menu_sub_fermita_class);
                DOM.kaŝu(sub);
                i.addEventListener("click",(event)=> {
                    const kaŝita = DOM.kaŝita(sub);
                    DOM.kaŝu(sub,!kaŝita);
                });
            } else {
                i.addEventListener("click",this.opcioj.reago);
            }

        });
    }

    refreŝigu() {
        this._preparu();
    }
}