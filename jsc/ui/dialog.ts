/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Dialog extends UIElement {
    //valoroj: any;
    static butonujo_klaso = "butonujo";

    static _default: {
        kampoj: {},
        butonoj: undefined,
        malfermu: undefined,
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

    static valoroj(element: HTMLDialogElement|string) {
        let d = super.obj(element);
        if (d instanceof Dialog) return d.valoroj();
    }

    static fermu(element: HTMLDialogElement|string) {
        let d = super.obj(element);
        if (d instanceof Dialog) d.fermu();
    }


    static malfermu(element: HTMLDialogElement|string) {
        let d = super.obj(element);
        if (d instanceof Dialog) d.malfermu();
    }

    constructor(element: HTMLDialogElement|string, opcioj: any) {
        super(element, opcioj);

        this.opcioj = Object.assign(this.opcioj,Dialog._default,opcioj);
        // evtl. kaŝu
        if (this.element.tagName != "DIALOG") DOM.kaŝu(this.element);
        // aldonu kruceton por fermi en la titollinio
        const h = this.element.querySelector("h1,h2,h3,h4");
        if (h) {
            const fb = document.createElement('button');
            fb.textContent = '\u2718';
            h.append(fb);
            fb.addEventListener("click",() => this.fermu());
        }
        // aldonu butonojn
        if (this.opcioj.butonoj) {
            const butonujo = document.createElement("div");
            butonujo.classList.add("butonujo");
            for (let [nomo, reago] of Object.entries(this.opcioj.butonoj)) {
                //kial ne funkcias? if (reago instanceof EventListener) {
                    const btn = document.createElement("button");
                    btn.textContent = nomo;
                    btn.addEventListener("click",(reago as EventListener).bind(this));
                    butonujo.append(btn);    
                //}
            }
            this.element.append(butonujo);
        }
    }

    malfermu() {
        // preparu la dialogon
        if (this.opcioj.malfermu instanceof Function) this.opcioj.malfermu();
        // montru la dialogon
        if (this.element.tagName != "DIALOG") 
            DOM.kaŝu(this.element,false);
        else
            (this.element as HTMLDialogElement).show();
    }

    malfermu_insiste() {
        if (this.element.tagName != "DIALOG") 
            DOM.kaŝu(this.element,false);
        else
            (this.element as HTMLDialogElement).showModal();
    }

    fermu() {
        // evtl. kaŝu
        if (this.element.tagName != "DIALOG") 
            DOM.kaŝu(this.element);
        else
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