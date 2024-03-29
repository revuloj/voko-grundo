/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM, HTMLCheckControlElement } from './dom';
import { UIElement } from './uielement';
import { UIStil } from './uistil';

export type DialogOpcioj = { kampoj: any, butonoj?: any, malfermu?: Function, 
    valorŝanĝo?: Function // evento lanĉita, post voko de "valoroj" kun novaj valoroj 
};

type ButonEcoj = { id?: string, text: string, click: Function };

export class Dialog extends UIElement {
    //valoroj: any;
    start_pos: {x: number, y: number};
    start_offs: {x: number, y: number};

    static aprioraj: DialogOpcioj = {
        kampoj: {},
        butonoj: undefined,
        malfermu: undefined,        
        valorŝanĝo: undefined // evento lanĉita, post voko de "valoroj" kun novaj valoroj
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
    private unua: HTMLElement | null;

    constructor(element: HTMLDialogElement|string, opcioj: any) {
        super(element, opcioj, Dialog.aprioraj);

        this.element.classList.add(UIStil.dialogo);

        // evtl. kaŝu
        if (this.element.tagName != "DIALOG") DOM.kaŝu(this.element);

        // la komenca enigkampo povas markiĝi per tabindex=1, sed ni
        // nun forigas tiun atributon por ne konfuzi la enfermo-algoritmon
        this.unua = this.element.querySelector("[tabindex='1']");
        if (this.unua) {
            this.unua.setAttribute("tabindex","0");
        } else {
            // alie ni prenos la nun unuan konvenan kampon (poste la unua estos la fermo-butono in la titolo....)
            this.unua = this.element.querySelector("input,textarea,button,selection");
        }
        
        // aldonu kruceton por fermi en la titollinio
        const h = this.element.querySelector("h1,h2,h3,h4");
        if (h instanceof HTMLElement) {
            const fb = document.createElement('button');
            fb.textContent = '\u2718';
            h.append(fb);
            fb.addEventListener("click",() => this.fermu());

            h.onpointerdown = this.komencuMovon.bind(this);
            h.onpointerup = this.finuMovon.bind(this);
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
                    if (click instanceof Function) {
                        const btn = this.butono({text: text, click: click})
                        butonujo.append(btn);        
                    }
                //}
            }
            this.element.append(butonujo);
        }
        // per keydown-evento ni enfermas TAB-premojn por ke ili ne povu forlasi la dialogon
        this.element.addEventListener("keydown",this.tab_enfermo.bind(this));
    }

    /**
     * Kreas unuopan butonon laŭ donitaj ecoj
     */
    butono(ecoj: ButonEcoj): Element {
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

        // metu la fokuson sur la unuan elementon (kiu havis tabindex=1)
        if (this.unua) {
            this.unua.focus();
        }
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

    tab_enfermo(evento: KeyboardEvent) {
        if (evento.keyCode === 9) { // TAB
            const fokuseblaj = this.element.querySelectorAll("input,button,textarea,selection");
            if (fokuseblaj.length) {
               const unua = <HTMLElement>fokuseblaj[0];
               const lasta = <HTMLElement>fokuseblaj[fokuseblaj.length - 1];
               const shift = evento.shiftKey;
               if (shift) {
                    if (evento.target === unua) { // shift-tab premita ĉe unua fokusebla dialog-elemento
                        lasta.focus();
                        evento.preventDefault();
                    }
                } else if (evento.target === lasta) { // tab pressed on last input in dialog
                    unua.focus();
                    evento.preventDefault();
                }
            }
        }
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
        let valj: any = {};
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

    komencuMovon(event: PointerEvent) {
        const h = event.currentTarget;
        //console.debug("mtrg:"+event.target.tagName);

        if (h instanceof HTMLElement && h == event.target) { // do aparte, ne reagu, se ni trafis la fermo-butonon
            this.start_pos = {x: event.clientX, y: event.clientY};
            this.start_offs = {x: this.element.offsetLeft, y: this.element.offsetTop};
            // ŝanĝu aprioran margin (auto) al fiksa
            // @ts-ignore
            this.element.style["margin-top"] = this.element.offsetTop+"px";
            // @ts-ignore
            this.element.style["margin-left"] = this.element.offsetLeft+"px";
            this.element.style.cursor = "move";


            //h.classList.add("ui-state-active");
            h.onpointermove = this.movu.bind(this);
            h.setPointerCapture(event.pointerId); 
        }
    }
      
    finuMovon(event: PointerEvent) {
        const h = event.currentTarget;
        if (h instanceof HTMLElement) {
            //h.classList.remove("ui-state-active");
            this.element.style.cursor = "auto";

            h.onpointermove = null;
            h.releasePointerCapture(event.pointerId);
        }
    }
      
    // por movi, vd. ekz-e
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
    // https://www.w3schools.com/howto/howto_js_draggable.asp
    movu(event: MouseEvent) {
        const h = event.currentTarget;
        if (h instanceof HTMLElement) {
            // const mx = event.movementX;
            // const my = event.movementY;
            const mx = event.clientX - this.start_pos.x;
            const my = event.clientY - this.start_pos.y;
            // @ts-ignore
            this.element.style["margin-top"] = Math.max(0, this.start_offs.y + my)+"px";
            // @ts-ignore
            this.element.style["margin-left"] = Math.max(0, this.start_offs.x + mx)+"px";
        }
    }


}