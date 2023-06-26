/**
 * (c) 2023 ĉ€ Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Dialog extends UIElement {
    valoroj: any;

    static dialog(element: HTMLDialogElement|string) {
        let d = super.obj(element);
        if (d instanceof Dialog) return d;
    }

    constructor(element: HTMLDialogElement|string, opcioj: any) {
        super(element, opcioj);
    }

    metu_valorojn(val: any) {
        // PRIPENSU: ĉu anstataŭe ni permesu ŝanĝi nur kelkajn valoroj konservante aliajn?
        this.valoroj = val;
    }

    donu_valorojn(): any {
        return this.valoroj;
    }

    malfermu() {
        (this.element as HTMLDialogElement).show();
    }

    malfermu_insiste() {
        (this.element as HTMLDialogElement).showModal();
    }

    faldu(faldita: boolean) {
        const el = this.element;
        DOM.kaŝu(el, faldita);
        
        if (faldita) {
            el.prev(".ui-dialog-titlebar").hide();
            this._setOption("position",{
                my: "center top",
                at: "center top+5",
                of: "#xml"
            });
            DOM.i("#xml_text")?.focus();
        } else {            
            el.prev(".ui-dialog-titlebar").show();
            this._setOption("position",{
                my: "center center",
                at: "center center",
                of: window
            });
        }
    };

}