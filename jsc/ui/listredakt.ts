/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';
import { DOM } from './dom';
/// import { UIStil } from './uistil';

/**
 * Klaso por provizi redakteblan liston. T.e. kies listeroj estas enig-elementoj (<input>).
 * Ĝi ankaŭ ebligas laŭbezone aldoni pliajn listerojn, ĉu kun valoro aŭ sen (t.e. nova maplena)
 */
export class ListRedakt extends UIElement {

    static aprioraj = {
    };

    /**
     * Kreas unu aŭ plurajn listojn por ĉiuj elementoj laŭ specifo
     * @param spec CSS-elektilo specifanta la koncernajn elementojn
     * @param opcioj la opcioj de la kreenda(j) listo(j)
     */
    static kreu(spec: string, opcioj?: any): void {
        document.querySelectorAll(spec).forEach((e) => {
            if (e instanceof HTMLElement)
                new ListRedakt(e,opcioj);
        });
    }

    /**
     * Redonas ListRedakt-objekton apartenantan al la donia elemento
     * @param element la elemento aŭ ties CSS-elektilo
     */
    static list(element: HTMLElement|string): ListRedakt|undefined {
        const e = super.obj(element);
        if (e instanceof ListRedakt) return e;
    }

    /**
     * Redonas ListRedakt-objekton, kies listero estas donita,
     * supozante ke ĝi estas tiel HTML-id-elemento. Aliokaze nenio redoniĝas
     */
    static list_kun_ero(ero: HTMLElement|string): ListRedakt|undefined {
        const el = (typeof ero === "string")?
            document.querySelector(ero) as HTMLElement : ero;
        if (el) {
            const patro = el.parentElement;
            if (patro) return ListRedakt.list(patro);
        }
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

    /**
     * Redonas la nombron de listeroj (supozante ke tiu estas egala al la nombro de HTML-id-elementoj)
     */
    nombro() {
        return this.element.childElementCount;
    }

    /**
     * Redonas la liston de valoroj, supozante ke temas pri HTML-lementoj kiuj havas econ 'value'
     */
    valoroj(): string[] {
        const vj: string[] = [];
        Array.from(this.element.children).forEach((c) => {
            if (DOM.isFormElement(c)) vj.push(c.value||'');
        })
        return vj;
    }

}