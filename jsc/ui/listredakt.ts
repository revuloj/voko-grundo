/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';
import { UIStil } from './uistil';

/**
 * Klaso por provizi redakteblan liston. T.e. kies listeroj estas enig-elementoj (<input>).
 * Ĝi ankaŭ ebligas laŭbezone aldoni pliajn listerojn, ĉu kun valoro aŭ sen (t.e. nova maplena)
 */
export class ListRedakt extends UIElement {

    static aprioraj = {
    };

    static kreu(spec: string, opcioj?: any) {
        document.querySelectorAll(spec).forEach((e) => {
            if (e instanceof HTMLElement)
                new ListRedakt(e,opcioj);
        });
    }

    static list(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof ListRedakt) return e;
    }

    constructor(element: HTMLElement|string, opcioj?: any, aprioraj = ListRedakt.aprioraj) {
        super(element, opcioj, aprioraj);
    
        // listerojn ni povas aktivigi per alklako
        // la aperon de alklakita listero vi povas influi per
        // la CSS de la klaso UIStil.aktiva
        /*
        this.element.addEventListener("click", (event) => {
            const trg = event.target;

            // malaktivigu antaŭan aktivan elementon
            const elektilo = '.'+UIStil.aktiva;
            const aktiva = this.element.querySelector(elektilo);
            if (aktiva instanceof HTMLElement) aktiva.classList.remove(UIStil.aktiva);

            // aktivigu alklakitan
            if (trg instanceof HTMLElement) {
                const listero = trg.closest(this.opcioj.listero);
                if (listero) {
                    listero.classList.add(UIStil.aktiva);
                }    
            }
        });*/
    }

    /**
     * Aldonas listeron.
     * @param html la elemento aŭ ties HTML-tekstp kiu provizas la listeron (ekz-e <input>-elemento)
     */
    aldonu(html: HTMLInputElement|string) {
        if (html instanceof HTMLInputElement)
            this.element.append(html);
        else
            this.element.insertAdjacentHTML("beforeend",html);
    }

}