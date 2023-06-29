/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

declare global {
    interface Element {
        _datumo: any;
    }
}

export class DOM {
    static klsKasxita = 'kasxita'; // CSS-klaso kiun ni aplikas al kaŝitaj elementoj

    // trovas elementon en HTML-dokumento per elektilo, ekz-e #el_id
    static e(elektilo: string): Element|null {
        return document.querySelector(elektilo);
    }

    // trovas ĉiujn elementojn en HTML-dokumento per elektilo kaj redonas kiel Array
    static ej(elektilo: string): Array<Element> {
        return Array.from(document.querySelectorAll(elektilo));
    }

    // trovas input-elementon en HTML-dokumento per elektilo, ekz-e #el_id
    static i(elektilo: string): HTMLInputElement|null {
        const e = DOM.e(elektilo);
        if (e instanceof HTMLInputElement) return e;
        return null;
    }

    // trovas elementon en HTML-dokumento per elektilo, ekz-e #el_id
    // kaj redonas la listond e idoj kiel Array
    static idoj(elektilo: string): Array<Element>|undefined {
        const e = DOM.e(elektilo);
        if (e) return Array.from(e.children);
    }

    // Redonas la tekst-enhavon de HTML-elemento, identigita per elektilo 
    static t(elektilo: string): string|null {
        const e = DOM.e(elektilo);
        if (e) return e.textContent;
        return null;
    }

    // Metas la tekst-enhavon de HTML-elemento, identigita per elektilo 
    static al_t(elektilo: string, teksto: string) {
        const e = DOM.e(elektilo);
        if (e) return e.textContent = teksto;
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

    // trovas input-elementon en HTML-dokumento per elektilo kaj redonas ĉu ĝi estas
    // elektita (angle: checked)
    static c(elektilo: string): boolean|null {
        const i = DOM.i(elektilo);
        if (i) return i.checked;
        return null
    }

    /**
     * Redonas datumojn alligitajn al elemento (ev. identigebla per elektilo)
     */
    static datum(e: Element|string, nomo: string): any {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) return el._datumo[nomo];
    }

    /**
     * Ligas datumojnal elemento (ev. identigebla per elektilo)
     */
    static al_datum(e: Element|string, nomo: string, datumo: any) {
        const el = (typeof e === "string")? DOM.e(e) : e;
        if (el) return el._datumo[nomo] = datumo;
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
        throw ("DOM.malreago ankoraŭ ne implementita!");
       
    }

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
                el.classList.add(DOM.klsKasxita);
            else
                el.classList.remove(DOM.klsKasxita);
        }
    }

    static kaŝita(e: Element|string) {
        const el = (typeof e === "string")? DOM.e(e) : e;
            if (el) return el.classList.contains(DOM.klsKasxita);
    }

    /**
     * Elektas tekstenhavon en formular-kampo. Se nur start estas
     * donita ĝi metas la kursoron tien. Se start ne estas donita ni
     * elektas la tutan enhavon
     */
    static elektu(e: HTMLInputElement|string, start?: number, end?: number) {
        const i = (typeof e === "string")? DOM.i(e) : e;
        if (i) {
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
     * Redonas tekstelekton de aktiva formularkampo
     */
    static elekto(e: HTMLInputElement|string): string {
        const i = (typeof e === "string")? DOM.i(e) : e;
        if (i) {
            const start = i.selectionStart||0;
            const end = i.selectionEnd||0;
            return i.value.substring(start, end);
        }
    }

    /**
     * Enigas tekston en formularkampon ĉe la kursoro
     */
    static enigu(e: HTMLInputElement|string, teksto: string) {
        const i = (typeof e === "string")? DOM.i(e) : e;
        if (i) {
            if (i.selectionStart || i.selectionStart === 0) {
                // Firefox and Webkit based
                var startPos = i.selectionStart;
                var endPos = i.selectionEnd;
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