/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';
import { UIStil } from './uistil';

/**
 * Klaso por trakti listojn, aparte, se ni bezonas ordigadon kaj unuopaj elementoj estu aktivigeblaj/elekteblaj
 */
export class List extends UIElement {
    static kmp_eo = new Intl.Collator('eo').compare;

    static aprioraj = {
        listero: "li", // CSS-elektilo por listeroj
        komparo: List.kmp_eo
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

    constructor(element: HTMLElement|string, opcioj?: any, aprioraj = List.aprioraj) {
        super(element, opcioj, aprioraj);
    
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

    /**
     * Aldonas listeron.
     * @param val la valoro, kiu uziĝas por ordigi la liston
     * @param listero la HTML-elemento de la listero por aldoni
     * @param obj  aldona objekto kunigita kun la listero, kaj kiun ni povas rericevi ĉe elekto de listero
     */
    aldonu(val: string|number, listero: Element, obj?: any) {
        const kmp = this.opcioj.komparo;
        let aldonita = false;

        if (val && kmp) {
            // provu aldoni la listeron la ordo (val)
            aldonita = Array.from(this.element.querySelectorAll(this.opcioj.listero)).some((l) => {
                if ( kmp(l.getAttribute("value"),val) > 0 ) {
                    l.before(listero);
                    return true;
                }
            });
        };

        // se ni ne jam enŝovis ie, ni alpendigas en la fino
        if ( !aldonita ) {
            this.element.append(listero);
        }        
    }

}