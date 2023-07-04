/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';

export class Skal extends UIElement {
    //valoroj: any;

    static aprioraj: {
        min?: number,
        max?: number,
        valoroj?: Array<number>,
        kreo?: Function,
        movo?: Function
    }

    static skal(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Skal) return e;
    }

    constructor(element: HTMLElement|string, opcioj?: any) {
        super(element, opcioj,Skal.aprioraj);

        this.element.classList.add("ui-slider","ui-slider-horizontal");

        // preparu la poziciilojn
        const valj = this.opcioj.valoroj; let n = 0;
        Array.from(this.element.children).forEach((id) => {
            id.classList.add("ui-slider-handle");
            if (id instanceof HTMLElement && valj) {
                const val = valj[n];
                id.textContent = ""+val;
                id.style.left = ""+this._position(val)+"%";

                id.onpointerdown = this.komencuMovon.bind(this);
                id.onpointerup = this.finuMovon.bind(this);
            };
            n++;
        });
    }

    komencuMovon(event) {
        const id = event.currentTarget;
        if (id instanceof HTMLElement) {
            id.classList.add("ui-state-active");
            id.onpointermove = this.movu.bind(this);
            id.setPointerCapture(event.pointerId);    
        }
    }
      
    finuMovon(event) {
        const id = event.currentTarget;
        if (id instanceof HTMLElement) {
            id.classList.remove("ui-state-active");
            id.onpointermove = null;
            id.releasePointerCapture(event.pointerId);
        }
    }
      
    // por movi, vd. ekz-e
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
    // https://www.w3schools.com/howto/howto_js_draggable.asp
    movu(event) {
        const id = event.currentTarget;
        if (id instanceof HTMLElement) {
            id.style.transform = `translate(${event.clientX}px)`;
        }
    }


    _position(val: number) {
        const min = this.opcioj.min||0;
        const max = this.opcioj.max||100;
        // KOREKTU: se ni vokas tro frue offsetWith / getBoundingClientRect().width redonas 0
        return (val-min)/(max-min)*100; 
    }


}