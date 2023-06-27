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
}