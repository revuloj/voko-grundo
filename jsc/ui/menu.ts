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
    static menu_divid_class = "ui-menu-divider";
    static menu_sub_fermita_class = "ui-menu-sub-fermita";

    static aprioraj: {
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
        super(element, opcioj, Menu.aprioraj);

        this.element.classList.add(Menu.menu_class);

        // preparu la menuerojn
        this._preparu();
    }

    _preparu() {
        this.element.querySelectorAll(this.opcioj.eroj).forEach((menuero) => {
            menuero.classList.add(Menu.menu_item_class);

            // ĉu submenu? traktu tiun submenuon            
            const sub = this._submenuo(menuero);
            if (sub) {
                menuero.classList.add(Menu.menu_sub_fermita_class);
                sub.classList.add(Menu.menu_class);
                DOM.kaŝu(sub);
                // ni aldonas klak-reagon al la menuero
                menuero.addEventListener("click",(event)=> {
                    this.element.querySelectorAll(this.opcioj.eroj).forEach((m_ero) => {
                        // estas la menuero mem
                        if (m_ero === menuero) {
                            const kaŝita = DOM.kaŝita(sub);
                            DOM.kaŝu(sub,!kaŝita);
                            if (!kaŝita) {
                                // metu la sumenuon tuj apud la menueron
                                sub.style.left = ""+(menuero.offsetLeft+menuero.offsetWidth)+"px";
                                sub.style.top = ""+menuero.offsetTop+"px";
                            }
                        } else { // ĉiujn aliajn submenuojn kaŝu kiam ni klakas sur unu el la ĉef-menueroj!
                            DOM.kaŝu(this._submenuo(m_ero));
                        }
                    });
                });
            } else if (menuero.textContent == '-') {
                // apartigilo sen kroma funkcio
                menuero.classList.add(Menu.menu_divid_class);
            } else {
                // reago al elekto de menuero (kiu ne estas submenuo)
                menuero.addEventListener("click",(event) => 
                    this.opcioj.reago.call(this,event,{menuero: menuero}));
            }

        });
    }

    _submenuo(menuero) {
        return menuero.querySelector("ul,ol");
    }

    refreŝigu() {
        this._preparu();
    }
}