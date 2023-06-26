/**
 * (c) 2023 ĉ€ Wolfram Diestel
 * laŭ GPL 2.0
 */


declare global {
    interface HTMLElement {
        _uielement: UIElement;
    }
}

export class UIElement {
    element: HTMLElement;
    opcioj: any;

    static obj(element: HTMLElement|string) {
        let el: HTMLElement|null;

        if (typeof element === "string") {
            el = document.querySelector(element) as HTMLElement;
        } else {
            el = element;
        }

        if (el && el._uielement) return el._uielement;
    }

    constructor(element: HTMLElement|string, opcioj: any) {
        let el: HTMLElement|null;

        if (typeof element === "string") {
            el = document.querySelector(element) as HTMLElement;
        } else {
            el = element;
        }

        if (el) {
            this.element = el;
            el._uielement = this;
        }

        for (let o in opcioj) {
            this.opcioj[o] = opcioj[o];
        }
    };

    _on(handlers: any) {
        for (let ev in handlers) {
            this.element.addEventListener(ev,handlers[ev]);
        }
    };

    _trigger(evnomo: string, ev?: Event, opc?: any) {
        if (!ev) 
            ev = new Event(evnomo, {'bubbles': true});
        if (opc)
            ev.data = opc;
        this.element.dispatchEvent(ev);
    }
    

};