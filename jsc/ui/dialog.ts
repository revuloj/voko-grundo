/**
 * (c) 2023 ĉ€ Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Dialog extends UIElement {
    //valoroj: any;

    opcioj: {
        kampoj: {},
        /*
        autoOpen: false,
        width: "auto",
        closeText: "", // fermu
        */
        /*
        show: {
            effect: "fade"
        },
        hide: {
            effect: "fade"
        },
        */
        valorŝanĝo: null // evento lanĉita, post voko de "valoroj" kun novaj valoroj
    };

    static dialog(element: HTMLDialogElement|string) {
        let d = super.obj(element);
        if (d instanceof Dialog) return d;
    }

    static fermu(element: HTMLDialogElement|string) {
        let d = super.obj(element);
        if (d instanceof Dialog) d.fermu();
    }

    constructor(element: HTMLDialogElement|string, opcioj: any) {
        super(element, opcioj);
    }

    malfermu() {
        (this.element as HTMLDialogElement).show();
    }

    malfermu_insiste() {
        (this.element as HTMLDialogElement).showModal();
    }

    fermu() {
        (this.element as HTMLDialogElement).close();
    }

    faldu(faldita = true) {
        const el = this.element;
        DOM.kaŝu(el, faldita);
        
        if (faldita) {
            /*
            el.prev(".ui-dialog-titlebar").hide();
            this._setOption("position",{
                my: "center top",
                at: "center top+5",
                of: "#xml"
            });
            */
            DOM.i("#xml_text")?.focus();
        } else {    
            /*        
            el.prev(".ui-dialog-titlebar").show();
            this._setOption("position",{
                my: "center center",
                at: "center center",
                of: window
            });
            */           
        }
    };

    refaldu() {
        this.faldu(DOM.kaŝita(this.element));
    }

    /*
    metu_valorojn(val: any) {
        // PRIPENSU: ĉu anstataŭe ni permesu ŝanĝi nur kelkajn valoroj konservante aliajn?
        this.valoroj = val;
    }

    donu_valorojn(): any {
        return this.valoroj;
    }
    */

    valoroj(): any {
        // elprenu valorojn el la dialogkampoj kaj redonu
        let valj = {};
        for (let [nomo,kampo] of Object.entries(this.opcioj.kampoj)) {
            const k = DOM.i(kampo as string);
            if (k) {
                const tp = k.getAttribute("type")
                if (tp == "checkbox" || tp == "radio") {
                    valj[nomo] = k.checked;
                } else {
                    valj[nomo] = k.value;
                }
            }
        }
        return valj;
    }

    al_valoroj(valj: any) {
        // ŝovu la valorojn al la unuopaj dialogkampoj
        for (let [nomo,kampo] of Object.entries(this.opcioj.kampoj)) {
            const k = DOM.i(kampo as string);
            if (k) {
                if (nomo in valj) {
                    let val = valj[nomo] || '';
                    const tp = k.getAttribute("type")
                    if (tp == "checkbox" || tp == "radio") {
                        k.checked = valj[nomo];
                    } else {
                        k.value = val;
                    }
                }    
            }
        }
        this._trigger("valorŝanĝo");        
    };


}