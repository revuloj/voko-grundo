/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */


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

        if (el && el._voko_ui) return el._voko_ui;
    }

    /**
     * profunda nedetrua fando de du objektoj
     * @param target
     * @param source
     */
    static fandu(target, source) {
        function isObject(item) {
            return (item && typeof item === 'object' && !Array.isArray(item));
        };

      let output = Object.assign({}, target);
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
          if (isObject(source[key])) {
            if (!(key in target))
              Object.assign(output, { [key]: source[key] });
            else
              output[key] = UIElement.fandu(target[key], source[key]);
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    }
    

    constructor(element: HTMLElement|string, opcioj: any, aprioraj = {}) {
        const el = (typeof element === "string")? document.querySelector(element) as HTMLElement : element;

        if (el) {
            this.element = el;
            if (el._voko_ui) console.warn("Jam ekzistas UI-elemento ĉe tiu ĉi HTML-elemento. La nova forviŝas ĝin!");
            el._voko_ui = this;
        }

        this.opcioj = UIElement.fandu(aprioraj, opcioj);
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