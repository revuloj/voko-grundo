/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';
import { UIStil } from './uistil';

export type Menuero = {menuero: HTMLElement};
type MenuReago = (event: Event, m_ero: Menuero) => void;
type MenuOpcioj = { eroj?: string, reago?: MenuReago, eniro?: string|HTMLElement };

class Menuer extends UIElement {
    static menuo(element: HTMLElement|string) {
        const menuer = UIElement.obj(element);
        if (menuer instanceof Menuer) return menuer.menuo;
    }

    constructor(element: HTMLElement|string, public menuo: Menu) {
        super(element,{});
        // aldonu klakreagon
        DOM.malreago(element,"click"); // forigu evtl. malnovan
        DOM.reago(element,"click",this._click.bind(this.element));
    };

    _click(event: Event) {
        const trg = event.currentTarget;

        if (trg instanceof HTMLElement) {
            const menuo = Menuer.menuo(trg);
            if (menuo) menuo.elekto(event,trg);    
        }
    };
}

class Submenu extends Menuer {
    static submenuo(element: HTMLElement|string) {
        const sm = UIElement.obj(element);
        if (sm instanceof Submenu) return sm;
    }

    static sublisto(element: HTMLElement|string) {
        const el = element instanceof HTMLElement? element: DOM.e(element);
        return el?.querySelector("ul,ol");
    }

    constructor(element: HTMLElement|string, menuo: Menu) {
        super(element,menuo);
        this.montru(false); // kaŝu komence
        // aldonu klakreagon
        DOM.malreago(element,"click"); // forigu evtl. antaŭe registritan!
        DOM.reago(element,"click",this._click.bind(this.element));
    };

    montru(montru = true) {
        const sublst = Submenu.sublisto(this.element);
        
        if (sublst instanceof HTMLElement) {
            if (montru) {
                this.element.classList.remove(UIStil.submenuo_fermita);
                DOM.kaŝu(sublst,false); // malkaŝu
                // metu la submenuon tuj apud la menueron
                sublst.style.left = ""+(this.element.offsetLeft+this.element.offsetWidth)+"px";
                sublst.style.top = ""+this.element.offsetTop+"px";
            } else {
                this.element.classList.add(UIStil.submenuo_fermita);
                sublst.classList.add(UIStil.menuo);
                DOM.kaŝu(sublst);    
            }
        }
    }

    _click(event: Event) {
        const m_el = event.currentTarget;
        const trg = event.target;

        if (m_el instanceof HTMLElement && trg instanceof HTMLElement) {
            const subm = Submenu.submenuo(m_el);
            const menuo = Menuer.menuo(m_el)

            console.debug("submenuo: "+m_el.textContent);

            const sublst = Submenu.sublisto(m_el);
            if (subm && menuo && sublst instanceof HTMLElement) {
                // se menuero en la submenuo estis klakita, reagu per
                // la ago registrita ĉe la menuo
                if (sublst.contains(trg)) {
                    const li = trg.closest("li");
                    if (li) try {
                        menuo.elekto(event,li);
                    } catch (exc) {
                        console.error(exc);
                    }
                }

                // malfermu, se fermita; fermu, se malfermiata
                const kaŝita = DOM.kaŝita(sublst);

                // evtl. fermu ĉiujn aliajn
                if (menuo) menuo.fermu_submenuojn();

                // montru ĉi-tiun, se antaŭe estis kaŝita
                if (kaŝita) subm.montru(true);
            }
        }
    }
}    


export class Menu extends UIElement {
    //valoroj: any;

    static aprioraj: MenuOpcioj = {
        eroj: ":scope>li",
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

        this.element.querySelectorAll(this.opcioj.eroj).forEach((ero) => {
            ero.classList.add(UIStil.menuero);

            // ĉu submenuo? traktu tiun submenuon            
            const sublst = Submenu.sublisto(ero);
            if (sublst) {
                new Submenu(ero,this);

            } else if (ero.textContent == '-') {
                // apartigilo sen kroma funkcio
                ero.classList.add(UIStil.menudividilo);

            } else {
                // simpla (sen submenuo)
                new Menuer(ero,this);
            }
        });
    }

    _klavpremo(event: KeyboardEvent) {
        const el = event.target;
        const subm = Submenu.submenuo(el as HTMLElement);

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

        if (el instanceof HTMLElement && this.element.contains(el)) {
            switch (event.key) {
                case "ArrowDown": 
                    iru(el,true); 
                    break;
                case "ArrowUp":
                    iru(el,false);
                    break;
                case "ArrowRight":
                    if (subm) subm.montru(true);
                    break;
                case "ArrowLeft":
                case "Dead":
                    if (subm) subm.montru(false);
                    break;
                case "Enter":
                case "Space":
                        el.click();
                    break;
            }
        }
    }

    eniru() {
        let ero: HTMLElement|undefined;
        if (this.opcioj.eniro) {
            ero = typeof this.opcioj.eniro === "string"? this.element.querySelector(this.opcioj.eniro) : this.opcioj.eniro;
        } else {
            ero = this.element.querySelector(this.opcioj.eroj); // unua menuero
        }

        if (ero) ero.focus();
    }

    elekto(event: Event, menuero_elm: HTMLElement) {
        this.opcioj.reago
            .call(this,event,{menuero: menuero_elm});
    }

    fermu_submenuojn() {
        this.element.querySelectorAll(this.opcioj.eroj).forEach((ero) => {
            const subm = Submenu.submenuo(ero)
            if (subm) subm.montru(false);
        });
    }

    refreŝigu() {
        this._preparu();
        console.debug("menu refreshigo: "+this.element.id);
    }
}