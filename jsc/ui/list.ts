/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';
import { UIStil } from './uistil';

/**
 * Klaso por trakti listojn, aparte, se unuopaj elementoj estu aktivigeblaj
 */
export class List extends UIElement {
    static aprioraj: {
        listero: "li" // CSS-elektilo por listeroj
    };

    static kreu(spec: string, opcioj?: any) {
        document.querySelectorAll(spec).forEach((e) => {
            if (e instanceof HTMLElement)
                new List(e,opcioj);
        });
    }

    static list(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof List) return e;
    }

    constructor(element: HTMLElement|string, opcioj?: any) {
        super(element, opcioj, List.aprioraj);
    
        // listerojn ni povas aktivigi per alklako
        // la aperon de alklakita listero vi povas infuli per
        // la CSS de la klaso UIStil.aktiva
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
        });
    }

}