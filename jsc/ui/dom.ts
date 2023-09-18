/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';
import { UIStil } from './uistil';
import { Valid } from './valid';
import { Klavar } from './klavar';

declare global {
    interface Element {
        _voko_datumo: any; // iuj datumoj alkroĉitaj al DOM-elemento
    }

    /*
    interface HTMLElement {
        _voko_ui?: UIElement;
        _voko_valid?: Array<Valid>; // testoj por validigi enkroĉitaj en DOM
        _voko_klavar?: Klavar; // registritaj klav-reagoj
    }*/

    interface HTMLOptionElement {
        _voko_propono?: any; // iu objekto, kiun ni provizas kun proponoj el datalist/option-elemento
    }
}

//HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|HTMLButtonElement;
export interface HTMLFormControlElement extends HTMLElement {
    value: string|null;
    disabled: boolean;
    type: string; // atentu, ke "type" povas havi diversajn informojn ekz-e ĉe <input>, <select>, <menu>...
    focus(): Function;
}

export interface HTMLCheckControlElement extends HTMLFormControlElement {
    checked: boolean;
}

export class DOM {

    static isCheckElement(obj: any): obj is HTMLCheckControlElement {
        return (obj && 'checked' in obj);
    }

    static isFormElement(obj: any): obj is HTMLFormControlElement {
        return (obj && 'value' in obj && 'disabled' in obj && 'focus' in obj);
    }

    // trovas elementon en HTML-dokumento per elektilo, ekz-e #el_id
    static e(elektilo: string): Element|null {
        return document.querySelector(elektilo);
    }

    // trovas ĉiujn elementojn en HTML-dokumento per elektilo kaj redonas kiel Array
    static ej(elektilo: string): Array<Element> {
        return Array.from(document.querySelectorAll(elektilo));
    }

    // trovas input-elementon en HTML-dokumento per elektilo, ekz-e #el_id
    static i(elektilo: string): HTMLFormControlElement|null {
        const e = DOM.e(elektilo);
        // PRIPENSU: iom ĝenas ke estas pluraj JS-klasoj kiuj havas .value sed
        // ne havas komunan bazolason kun tiu atributo
        // ni difinis TS-interfacon, sed oni ne povas rekte testi kontraŭ tiu
        /*if (e instanceof HTMLInputElement 
         || e instanceof HTMLTextAreaElement
         || e instanceof HTMLSelectElement
         || e instanceof HTMLButtonElement) */
        if (DOM.isFormElement(e)) return (<HTMLFormControlElement>e);
        return null;
    }

    // trovas elementon en HTML-dokumento per elektilo, ekz-e #el_id
    // kaj redonas la liston de idoj kiel Array
    static idoj(e: Element|string): Array<Element>|undefined {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) return Array.from(el.children);
    }

    // Redonas la tekst-enhavon de HTML-elemento, identigita per elektilo 
    static t(e: Element|string): string|null {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) return el.textContent;
        return null;
    }

    // Metas la tekst-enhavon de HTML-elemento, identigita per elektilo 
    static al_t(e: Element|string, teksto: string) {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) return el.textContent = teksto;
    }
    

    // Redonas la HTML-enhavon de HTML-elemento, identigita per elektilo
    static html(elektilo: string): string|null {
        const e = DOM.e(elektilo);
        if (e) return e.innerHTML;
        return null;
    }

    // Metas la HTML-enhavon de HTML-elemento, identigita per elektilo
    static al_html(elektilo: string, html: string) {
        const e = DOM.e(elektilo);
        if (e) return e.innerHTML = html;
    }


    // trovas input-elementon en HTML-dokumento per elektilo kaj redonas ties valoron
    static v(elektilo: string): string|null {
        const i = DOM.i(elektilo);
        if (i) return i.value;
        return null
    }

    // Metas vaoloron al input-elemento en HTML-dokumento identigita per elektilo
    static al_v(elektilo: string, val: string) {
        const i = DOM.i(elektilo);
        if (i) return i.value = val;
    }

    /**
     * Malplenigas la valoron (atributo value), sed temas pri elemento de formularo.
     * Se temas pri alia elemento, ĝi forigas la tutan enhavon (textContent).
     */
    static malplenigu(elektilo: string) {
        document.querySelectorAll(elektilo).forEach((e) => {
            if (DOM.isFormElement(e)) e.value = ''
            else e.textContent = '';
        });
    }

    // trovas input-elementon en HTML-dokumento per elektilo kaj redonas ĉu ĝi estas
    // elektita (angle: checked)
    static c(i: Element|string): boolean|null {
        const el = (typeof i === "string")? DOM.i(i) : i;
        if (DOM.isCheckElement(el)) return el.checked;
        return null
    }

    /**
     * Redonas datumojn alligitajn al elemento (ev. identigebla per elektilo)
     */
    static datum(e: Element|string, nomo: string): any {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) return el._voko_datumo[nomo];
    }

    /**
     * Ligas datumojn al elemento (ev. identigebla per elektilo)
     */
    static al_datum(e: Element|string, nomo: string, datumo: any) {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) {
            if (! el._voko_datumo) el._voko_datumo = {};
            el._voko_datumo[nomo] = datumo;
        }
    }

    /**
     * Kaŭzas eventon ĉe la donita elemento
     */
    static evento(e: EventTarget|string, evento: string) {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) {
            const ev = new Event(evento);
            el.dispatchEvent(ev);
        }
    }

    static reago(e: EventTarget|string, evento: string, reago: EventListenerOrEventListenerObject) {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) el.addEventListener(evento, reago);
    }

    /**
     * Forigu reagojn al iu evento
     */
    static malreago(e: EventTarget|string, evento: string) {
        const el = (typeof e === "string")? DOM.e(e) : e;
        //if (el) el.removeEventListener(evento, reago);
        console.error("DOM.malreago ankoraŭ ne implementita!");

        // ne ekzistas normigita maniero eltrovi registritajn evento-reagojn por forigi ilin
        // do nencesus mem registri ilin por poste povi forigi ilin, vd.:
        // https://www.sqlpac.com/en/documents/javascript-listing-active-event-listeners.html#listing-the-events-added-with-the-method-addeventlistener
       
    }

    /**
     * Registras reagojn al certa evento ĉe la idoj de elemento.
     * La idoj estas donitaj per CSS-elektilo aplikata al la enhavanta elmento
     * @param e 
     * @param evento 
     * @param idspec 
     * @param reago 
     */
    static ido_reago(e: Element|string, evento: string, idspec: string, reago: EventListenerOrEventListenerObject) {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) {
            el.querySelectorAll(idspec).forEach((id) => {
                id.addEventListener(evento, reago);
            });
        }
    }

    static klak(e: EventTarget|string, reago: EventListenerOrEventListenerObject) {
        DOM.reago(e,"click",reago);
    };

    static klavpremo(e: EventTarget|string, reago: EventListenerOrEventListenerObject) {
        DOM.reago(e,"keypress",reago);
    };

    static klaveko(e: EventTarget|string, reago: EventListenerOrEventListenerObject) {
        DOM.reago(e,"keydown",reago);
    };

    static klavlaso(e: EventTarget|string, reago: EventListenerOrEventListenerObject) {
        DOM.reago(e,"keyup",reago);
    };

    static ŝanĝo(e: EventTarget|string, reago: EventListenerOrEventListenerObject) {
        DOM.reago(e,"change",reago);
    };

    static forigu(e: Element|string) {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) el.remove();
    }

    static kaŝu(e: Element|string, kaŝita=true) {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) {
            if (kaŝita)
                el.classList.add(UIStil.kaŝita);
            else
                el.classList.remove(UIStil.kaŝita);
        }
    }

    static kaŝita(e: Element|string) {
        const el = (typeof e === "string")? DOM.e(e) : e;
            if (el) return el.classList.contains(UIStil.kaŝita);
    }

    static kaŝu_plurajn(elektilo: string, kaŝita=true) {
        document.querySelectorAll(elektilo).forEach((el) => {
            if (kaŝita)
                el.classList.add(UIStil.kaŝita);
            else
                el.classList.remove(UIStil.kaŝita);
        });
    }

    /**
     * Elektas tekstenhavon en formular-kampo. Se nur start estas
     * donita ĝi metas la kursoron tien. Se start ne estas donita ni
     * elektas la tutan enhavon
     */
    static elektu(e: HTMLInputElement|string, start?: number, end?: number) {
        const i = (typeof e === "string")? DOM.i(e) : e;
        if (i instanceof HTMLInputElement || i instanceof HTMLTextAreaElement) {
            if (start === undefined) {
                start = 0;
                end = i.value.length;
            } else if (end === undefined || end < start) {
                end = start;
            };
            i.selectionStart = start;
            i.selectionEnd = end;
            i.blur();
            i.focus();    
        }
    }

    /**
     * Redonas tekstelekton de aktiva formularkampo aŭ alia HTML-elemento
     */
    static elekto(e: HTMLElement|string): string|undefined {
        const el = (typeof e === "string")? DOM.i(e) : e;
        if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
            const start = el.selectionStart||0;
            const end = el.selectionEnd||0;
            return el.value.substring(start, end);
        } else {
            // PLIBONIGU: fakte tie ĉi ne gravas la elemento, povas esti pluraj eĉ en HTML-paĝo
            // eble ni ankaŭ por Input/TextArea uzu window.getSelection, ĉu?
            return window.getSelection()?.toString();
        }
    }

    /**
     * Enigas tekston en formularkampon ĉe la kursoro
     */
    static enigu(e: HTMLInputElement|string, teksto: string) {
        const i = (typeof e === "string")? DOM.i(e) : e;
        if (i instanceof HTMLInputElement || i instanceof HTMLTextAreaElement) {
            if (i.selectionStart || i.selectionStart === 0) {
                // Firefox and Webkit based
                var startPos = i.selectionStart;
                var endPos = i.selectionEnd||startPos;
                var scrollTop = i.scrollTop;
                const val:string = i.value||'';
                i.value = val.substring(0, startPos) + teksto + val.substring(endPos, val.length);
                i.focus();
                i.selectionStart = startPos + teksto.length;
                i.selectionEnd = startPos + teksto.length;
                i.scrollTop = scrollTop;
            } else {
                i.value += teksto;
                i.focus();
            }
        }
    }
}