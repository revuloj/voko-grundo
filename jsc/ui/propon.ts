/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Propon extends UIElement {
    private temp;

    static aprioraj = { 
        /* ĉar datalist ne sendas eventon, kiam ni elektas ion, ni
        bezonas iel distingi entajpitajn vortojn de elektitaj, resp. certigi
        ke elektante listeron, tiu distingiĝu de la entajpita vorto, por kaŭzi
        input/change-eventon ĉe la celkampo. 
        Tiucele ni aldonas sufikson al la listeroj, per kiu ni distinas ilin.
        Apriore ni uzas nerompeblan spaceton. */
        sufikso: '\u202f',
        source: undefined, // la fonto povas esti areo aŭ funkcio, kiu liveras la erojn
        select: undefined // reago al elekto
    }

    static propon(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Propon) return e;
    }


    constructor(element: HTMLInputElement|string, opcioj?: any) {
        super(element, opcioj, Propon.aprioraj);

        if (this.element instanceof HTMLInputElement) {
            this.element.setAttribute("autocomplete","off");
            this.element.addEventListener("input",this._input.bind(this));
        }

        // se ni ricevis la proponliston kiel areo, ni tuj plenigas la elementon "datalist"
        if (this.opcioj.source instanceof Array) {
            // la fonto estas areo de objektoj, kies atributoj "value" enhavas la unuopajn vortojn
            this.proponlisto(this.opcioj.source);
        }

        // Ni volas, ke la listo ankaŭ montriĝu, kiam ni montras per la muso al la kampo, ne nur post
        // iu entajpo,
        // vd. https://stackoverflow.com/questions/15622076/making-html5-datalist-visible-when-focus-event-fires-on-input
        this.element.addEventListener("click", () => {
            const dl = this._datalist();
            if (dl instanceof HTMLElement) {
                dl.style.display = "block";        
                dl.style.display = "none";    
            }
            
/*
        this.element.addEventListener("mousedown", () => {
            if (this.element instanceof HTMLInputElement) {
                this.temp = this.element.value; 
                this.element.value = ''    
            }
            */
        });
        /*
        this.element.addEventListener("mouseup", () => {
            if (this.element instanceof HTMLInputElement) 
                this.element.value = this.temp
        });
        */
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
                // la fonto estas vokenda funkcio. Ni vokas ĝin transdonante la serĉata vorton (term)
                this.opcioj.source({term: term},this.proponlisto.bind(this));
            } 
            /*
            else if (this.opcioj.source instanceof Array) {
                // la fonto estas areo de objektoj, kies atributoj "value" enhavas la unuopajn vortojn
                this.proponlisto(this.opcioj.source);
            }
            */
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

        // la uzanto elektis listeron, enmetu ties datumojn en la formularkampo(j)n
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
                        const alkroĉita = opt_elektita._voko_propono;
                        // kion ni faru per la rezulto, prefere la uzanto de Propon provizu
                        // reagon al kiu ni sendu tion, kaj ĝi decidu mem pri kion fari!
                        elekt_reago("elektita",alkroĉita);
                    }
                }
            }
        
        } else {
            // la uzanto tajpis ion en la serĉkampo, proponu konvenajn vortojn el la listo
            this.proponu();
        }
    }

    proponlisto(listo: Array<any>) {
        const datalist = this._datalist();
        const suff = this.opcioj.sufikso;

        if (datalist instanceof HTMLElement) {
            datalist.textContent = ''; // evtl. malplenigu                
            listo.forEach((e) => {
                const val = e.value;
                const opt = document.createElement("option");
                opt.setAttribute("value",val+suff);
                opt._voko_propono = e;
                datalist.append(opt);
            });
        } 
    }
}