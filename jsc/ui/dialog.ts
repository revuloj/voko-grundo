/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM, HTMLCheckControlElement } from './dom';
import { UIElement } from './uielement';
import { UIStil } from './uistil';

export class Dialog extends UIElement {
    //valoroj: any;

    static aprioraj: {
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

    public faldita: boolean = false;

    constructor(element: HTMLDialogElement|string, opcioj: any) {
        super(element, opcioj, Dialog.aprioraj);

        this.element.classList.add(UIStil.dialogo);

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
        const bopc = this.opcioj.butonoj;
        if (bopc) {
            const butonujo = document.createElement("div");
            butonujo.classList.add("butonujo");

            if (bopc instanceof Array) {
                bopc.forEach( (bo) => butonujo.append(this.butono(bo)) );
            } else 
                for (let [text, click] of Object.entries(this.opcioj.butonoj)) {
                //kial ne funkcias? if (reago instanceof EventListener) {
                    const btn = this.butono({text: text, click: click})
                    butonujo.append(btn);    
                //}
            }
            this.element.append(butonujo);
        }
    }

    /**
     * Kreas unuopan butonon laŭ donitaj ecoj
     */
    butono(ecoj): Element {
        // ĉu ni uzu klason Buton el ./buton.ts?
        const btn = document.createElement("button");
        btn.textContent = ecoj.text;
        if (ecoj.id) btn.id = ecoj.id;
        btn.addEventListener("click",(ecoj.click as EventListener).bind(this));
        return btn;
    }


    malfermu() {
        // preparu la dialogon
        if (this.opcioj.malfermu instanceof Function) 
            this.opcioj.malfermu.call(this);
            
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

        Array.from(el.getElementsByClassName(UIStil.faldebla)).forEach((f) => {
            DOM.kaŝu(f, faldita);
        });

        this.faldita = faldita;

        if (faldita) {
            this.element.classList.add(UIStil.faldita);
        } else {
            this.element.classList.remove(UIStil.faldita);
        }
        
            /*
        if (faldita) {
            el.prev(".ui-dialog-titlebar").hide();
            this._setOption("position",{
                my: "center top",
                at: "center top+5",
                of: "#xml"
            });
            DOM.i("#xml_text")?.focus();
        } else {    
            /*        
            el.prev(".ui-dialog-titlebar").show();
            this._setOption("position",{
                my: "center center",
                at: "center center",
                of: window
            });
        }
            */           
    };

    refaldu() {
        this.faldu(!this.faldita);
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
                    valj[nomo] = DOM.c(k);
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
                    const tp = k.getAttribute("type");
                    if (DOM.isCheckElement(k) && tp == "checkbox" || tp == "radio") {
                        (k as HTMLCheckControlElement).checked = valj[nomo];
                    } else {
                        k.value = val;
                    }
                }    
            }
        }
        this._trigger("valorŝanĝo");        
    };


}