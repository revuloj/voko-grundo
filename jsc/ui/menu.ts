/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';
import { UIStil } from './uistil';

export class Menu extends UIElement {
    //valoroj: any;

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

        this.element.classList.add(UIStil.menuo);

        // preparu la menuerojn
        this._preparu();

        // traktu klavpremojn por navigado
        document.addEventListener("keydown",this._klavpremo.bind(this));
    }

    _preparu() {
        this.element.querySelectorAll(this.opcioj.eroj).forEach((menuero) => {
            menuero.classList.add(UIStil.menuero);

            // ĉu submenuo? traktu tiun submenuon            
            const sub = this._submenuo(menuero);
            if (sub) {
                this._montru_submenuon(menuero,false); // kaŝu

                // ni aldonas klak-reagon al la menuero
                menuero.addEventListener("click",(event)=> {
                    this.element.querySelectorAll(this.opcioj.eroj).forEach((m_ero) => {
                        // estas la menuero mem, ni montras aŭ kaŝas ĝian submenuon
                        if (m_ero === menuero) {
                            const kaŝita = DOM.kaŝita(sub);
                            this._montru_submenuon(menuero,kaŝita);
                        } else { // ĉiujn aliajn submenuojn kaŝu kiam ni klakas sur unu el la ĉef-menueroj!
                            DOM.kaŝu(this._submenuo(m_ero));
                        }
                    });
                });
            } else if (menuero.textContent == '-') {
                // apartigilo sen kroma funkcio
                menuero.classList.add(UIStil.menudividilo);
            } else {
                // reago al elekto de menuero (kiu ne estas submenuo)
                menuero.addEventListener("click",(event) => 
                    this.opcioj.reago.call(this,event,{menuero: menuero}));
            }

        });
    }

    _klavpremo(event) {
        const el = event.target;
        function iru(el: Element|null, malsupren: boolean) {
            let mi = el;
            if (mi) do {
                mi = malsupren? mi.nextElementSibling : mi.previousElementSibling;
            } while (mi instanceof HTMLElement && !mi.classList.contains("ui-menu-item"));
                
            // ĉu ni trovis najbaran menueron?
            if (mi instanceof HTMLElement && mi.classList.contains("ui-menu-item")) {
                event.preventDefault();
                mi.focus();
            }
        }

        if (el instanceof HTMLElement) {
            switch (event.key) {
                case "ArrowDown": 
                    iru(el,true); 
                    break;
                case "ArrowUp":
                    iru(el,false);
                    break;
                case "ArrowRight":
                    this._montru_submenuon(el,true);
                    break;
                case "ArrowLeft":
                case "Dead":
                    this._montru_submenuon(el,false);
                    break;
                case "Enter":
                case "Space":
                        el.click();
                    break;
            }
        }
    }

    _submenuo(menuero) {
        return menuero.querySelector("ul,ol");
    }

    _montru_submenuon(menuero, montru = true) {
        const sub = this._submenuo(menuero);
        if (sub) {
            if (montru) {
                DOM.kaŝu(sub,false);
                menuero.classList.remove(UIStil.submenuo_fermita);
                // metu la sumenuon tuj apud la menueron
                sub.style.left = ""+(menuero.offsetLeft+menuero.offsetWidth)+"px";
                sub.style.top = ""+menuero.offsetTop+"px";
            } else {
                menuero.classList.add(UIStil.submenuo_fermita);
                sub.classList.add(UIStil.menuo);
                DOM.kaŝu(sub);    
            }
        }
    }

    refreŝigu() {
        this._preparu();
    }
}