/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

export class Eraro {
    static al(element: HTMLElement|string, msg: string) {
        let el: HTMLElement|null;

        if (typeof element === "string") {
            el = document.querySelector(element) as HTMLElement;
        } else {
            el = element;
        }

        if (el) {
            el.textContent = msg;
            el.classList.remove("kasxita");
        }
    }

    static http(element: HTMLElement|string, request: XMLHttpRequest) {
        const url = request.responseURL.split("/").slice(-1);
        let msg = "";
        switch (request.status) {
            case 404: msg = "La petita dosiero ("+url+") ne ekzistas"; break;
            case 400: msg = "Nevalida peto"; break;
        }
        if (request.responseText) msg += ": "+request.responseText;
        Eraro.al(element,msg);
    }
}