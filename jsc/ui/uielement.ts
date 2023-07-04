/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { fandu } from '../x';

declare global {
    interface HTMLElement {
        _uielement: UIElement;
    }
}

export class UIElement {
    public element: HTMLElement;
    public opcioj: any;    

    static obj(element: HTMLElement|string) {
        let el: HTMLElement|null;

        if (typeof element === "string") {
            el = document.querySelector(element) as HTMLElement;
        } else {
            el = element;
        }

        if (el && el._uielement) return el._uielement;
    }


    constructor(element: HTMLElement|string, opcioj: any, aprioraj = {}) {
        const el = (typeof element === "string")? document.querySelector(element) as HTMLElement : element;

        if (el) {
            this.element = el;
            el._uielement = this;
        }

        this.opcioj = fandu(aprioraj, opcioj);
    };

    _on(handlers: any) {
        for (let ev in handlers) {
            this.element.addEventListener(ev,handlers[ev].bind(this));
        }
    };

    /**
     * Trovas reagon en opcioj kaj vokas la koncernan funkcion
     * @param evnomo 
     * @param ev 
     * @param extra 
     */
    _trigger(evnomo: string, ev?: Event, extra?: any) {
        if (evnomo in this.opcioj) {
            const reago = this.opcioj[evnomo];
            if (reago instanceof Function)
                reago.call(this,ev,extra);
        }
    } 
    

};