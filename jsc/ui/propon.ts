/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';

export class Propon extends UIElement {
    /**
     * Ŝlosilo, sub kiu ni alkroĉas trovojn en la DOM-strukturo
     * ĉe datalist/option-elementoj
     */
    static revo_option_obj = "_ReVo_Trovo";

    static aprioraj: { 
        source: undefined,
        select: undefined
    }

    static propon(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Propon) return e;
    }

    constructor(element: HTMLInputElement|string, opcioj?: any) {
        super(element, opcioj,Propon.aprioraj);

        if (this.element instanceof HTMLInputElement) {
            this.element.setAttribute("autocomplete","off");
            this.element.addEventListener("input",this._input.bind(this));
        }
    }

    _datalist() {
        const dlist = this.element.getAttribute("list");
        if (dlist) {
            return document.getElementById(dlist);
        } else {
            throw new Error("Mankas atributo 'list' por pronponlisto ĉe: "+this.element.id);
        }
    }

    proponu() {
        // Ni legas la enhavon (aŭ lastan vorton?) de la
        // elemento kaj uzas la koncernajn rimedojn (listo, serĉ-funkcio)
        // por trovi aron da proponoj...
        const term = (this.element as HTMLInputElement).value;
        const dlist_subteno = document.createElement("datalist").options;

        if (term && dlist_subteno) {
            if (this.opcioj.source instanceof Function) {
                this.opcioj.source({term: term},this.proponlisto.bind(this));
            }
        }
    }

    _input(event) {
        // Unue kontrolu, ĉu la uzanto elektis eron el datalist.
        // La retumiloj iom diverse ebligas distingi de normala entajpo.
        // Vd. ankaŭ diskuton en:
        // https://stackoverflow.com/questions/23647359/how-do-i-get-the-change-event-for-a-datalist
        const dlist_elekto = !(event instanceof InputEvent) || // Chrome k.s.
            event.inputType === 'insertReplacementText'; // Firefox
              // kio pri Safari?

        if (dlist_elekto) {
            // ni redonu la elementon alkroĉitan al la listero
            const val = (this.element as HTMLInputElement).value;
            const elekt_reago = this.opcioj.select;

            if (val && elekt_reago instanceof Function) {
                const datalist = this._datalist();
                if (datalist instanceof HTMLElement) {

                    const opt_elektita = Array.from(datalist.querySelectorAll("option")).find((o) => {
                        return (o.value == val)
                    });
                    if (opt_elektita) {
                        const alkroĉita = opt_elektita[Propon.revo_option_obj];
                        // kion ni faru per la rezulto, prefere la uzanto de Propon provizu
                        // reagon al kiu ni sendu tion, kaj ĝi decidu mem pri kion fari!
                        elekt_reago("elektita",alkroĉita);
                    }
                }
            }

        } else {
            this.proponu();
        }
    }

    proponlisto(listo: Array<any>) {
        const datalist = this._datalist();
        if (datalist instanceof HTMLElement) {
            datalist.textContent = ''; // evtl. malplenigu                
            listo.forEach((e) => {
                const val = e.value;
                const opt = document.createElement("option");
                opt.setAttribute("value",val);
                opt[Propon.revo_option_obj] = e;
                datalist.append(opt);
            });
        } 
    }
}