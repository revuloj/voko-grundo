/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

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

    // trovas input-elementon en HTML-dokumento per elektilo, ekz-e #el_id
    static i(elektilo: string): HTMLInputElement|null {
        const e = DOM.e(elektilo);
        if (e instanceof HTMLInputElement) return e;
        return null;
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
}