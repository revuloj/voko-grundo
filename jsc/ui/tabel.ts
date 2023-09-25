/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';
import { UIStil } from './uistil';

/**
 * Klaso por trakti HTML-tabelon, aparte, se ni bezonas aldoni linion post linio dinamike
 */
export class Tabel extends UIElement {

    static aprioraj = {
        // CSS-elektilo por tabel-linioj
        // por fari unuopajn ĉelojn aktivigeblaj, difinu tablero: "td"
        tabelero: "tr", 
    };

    static kreu(spec: string, opcioj?: any) {
        document.querySelectorAll(spec).forEach((e) => {
            if (e instanceof HTMLElement)
                new Tabel(e,opcioj);
        });
    }

    static tabel(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Tabel) return e;
    }

    constructor(element: HTMLElement|string, opcioj?: any, aprioraj = Tabel.aprioraj) {
        super(element, opcioj, aprioraj);
    
        // tabelliniojn7ĉelojn ni povus aktivigi per alklako
        // la aperon de alklakita tabelero vi povas influi per
        // la CSS de la klaso UIStil.aktiva
        this.element.addEventListener("click", (event) => {
            const trg = event.target;

            // malaktivigu antaŭan aktivan elementon
            const elektilo = '.'+UIStil.aktiva;
            const aktiva = this.element.querySelector(elektilo);
            if (aktiva instanceof HTMLElement) aktiva.classList.remove(UIStil.aktiva);

            // aktivigu alklakitan
            if (trg instanceof HTMLElement) {
                const tabelero = trg.closest(this.opcioj.tabelero);
                if (tabelero) {
                    tabelero.classList.add(UIStil.aktiva);
                }    
            }
        });
    }

    /**
     * Malplenigas la tabelon
     * @param kapo - se 'true' ni forigas ankaŭ liniojn kun kapelemento (<th>)
     */
    malplenigu(kapo = false) {
        this.element.querySelectorAll("tr").forEach((tr) => {
            if (kapo || tr.querySelector('td')) tr.remove();
        })
    }

    /**
     * Aldonas linion.
     * @param eroj la vektoro de elementoj aŭ ties HTML-teksto, kiun ni aldonas malsupre al la tabelo
     * @param kapo temas pri la kaplinio de la tabelo - ni uzas <th> anstataŭ <td>
     */
    aldonu(eroj: Array<HTMLElement|string>, klasoj: string[], kapo = false) {
        const tr = document.createElement("tr");
        if (klasoj) tr.classList.add(...klasoj);
        eroj.forEach((e) => {
            const td = document.createElement(kapo?"th":"td");
            if (e instanceof HTMLElement)
                td.append(e);
            else
                td.insertAdjacentHTML("afterbegin",e);
            tr.append(td);
        });
        // se la tabelo havas thead/tbody ni enŝovas la novan linion tie,
        // aliokaze en la fino de <table>
        let t1: HTMLElement|HTMLTableElement|HTMLTableSectionElement|null = kapo? this.element.querySelector("thead") : this.element.querySelector("tbody");
        if (!t1) t1 = this.element;
        if (t1) t1.append(tr);
    }

}