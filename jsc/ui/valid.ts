/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { DOM } from './dom';
import { UIElement } from './uielement';
import { Eraro } from './erar';


export class Valid extends UIElement {

    static aldonu(elemento: HTMLElement|string, opcioj: any) {
        let el: HTMLElement|null;
        if (typeof elemento === "string") {
            el = document.getElementById(elemento);
        } else {
            el = elemento;
        }

        if (el) {
            const val = new Valid(el,opcioj);
            if (el._voko_valid) 
                el._voko_valid.push(val)
            else
                el._voko_valid = [val];
        }  
    }

    static valida(elemento: HTMLElement|string) {
        let el: HTMLElement|null;
        if (typeof elemento === "string") {
            el = document.getElementById(elemento);
        } else {
            el = elemento;
        }

        if (el && el._voko_valid) {
            //return el._valid();
            let _valida_ = true;

            const validigoj: Array<Valid> = el._voko_valid;

            validigoj.forEach((v) => {
                if (! v.check()) _valida_ = false;
            })

            return _valida_;
        } else
            return true; // se neniu testo difinitia, tiam apriore valida
    }

/*
function() {
    var valid = true;
    this.each(function() {
        const e = $(this);
        if (e.Checks && e.Checks("instance")) {
            if (! e.Checks("check")) valid=false;
        }
    });
    return valid;
}
*/

    opcioj: any = {
        // testoj kun mesaĝoj, montrendaj, se la koncerna testo malsukcesas, ekz-e:
        // nonempty: 'Valoro de X devas ion enhavi',
        // pattern: /^...$/ or pattern: { regex: /^...$/, message: "bla bla" },
        // err_to: '#my_err' // kie montri la eraron        
    };

    _nonempty?: boolean;
    _nonempty_msg?: string;
    _pattern?: RegExp;
    _pattern_msg?: string;
    _err_fld?: string;

    constructor(element: HTMLElement, opcioj: any) {
        super(element,opcioj);

        const id = this.element.id;
        if (this.opcioj.nonempty) {
           this._nonempty = true;
           this._nonempty_msg = this.opcioj.nonempty;
        }
        //if (typeof this.options.pattern === 'regexp') {
        if (this.opcioj.pattern instanceof RegExp) {
            var label = DOM.t("label[for='"+id+"']");
            this._pattern  = this.opcioj.pattern;
            this._pattern_msg = label ? 'La donita valoro por ' + label + 'ne estas valida' : 'Nevalida valoro.';
        } else if (typeof this.opcioj.pattern === 'object') {
            this._pattern  = this.opcioj.pattern.regex;
            this._pattern_msg = this.opcioj.pattern.message;  
        }
        this._err_fld = this.opcioj.err_to;
    };

    check() {
        var e = this.element;
        var err = this._err_fld;
        var ok = true;

        if (this._err_fld) {
            if (this._nonempty && (e as HTMLInputElement).value == '') { 
                if (this._nonempty_msg) Eraro.al(this._err_fld, this._nonempty_msg)        
                ok = false;
            } else if (this._pattern && ! (e as HTMLInputElement).value.match(this._pattern)) {
                if (this._pattern_msg) Eraro.al(this._err_fld, this._pattern_msg);
                ok = false;
            } 
            if (ok) {
                const elm = DOM.e(this._err_fld);
                if (elm) DOM.kaŝu(elm);
            }
        }
        return ok;
    }
};

