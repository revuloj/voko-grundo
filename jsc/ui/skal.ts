/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */

import { UIElement } from './uielement';
import { UIStil } from './uistil';

export class Skal extends UIElement {
    public valoroj: Array<number>;

    /*
    public opcioj: {
        min?: number,
        max?: number,
        valoroj?: Array<number>,
        kreo?: Function,
        movo?: Function
    }
    */

    static aprioraj = {};

    static skal(element: HTMLElement|string) {
        const e = super.obj(element);
        if (e instanceof Skal) return e;
    }

    constructor(element: HTMLElement|string, opcioj?: any) {
        super(element, opcioj,Skal.aprioraj);

        this.element.classList.add(UIStil.skalo,UIStil.skalo_horizonta);
        this.element.style.position = "relative"; // necesas por ke pozicioj
            // de maniloj rilatu al la skalo!

        // preparu la poziciilojn
        const valj = this.opcioj.valoroj; let n = 0;
        Array.from(this.element.children).forEach((manilo) => {
            manilo.classList.add(UIStil.manilo);
            if (manilo instanceof HTMLElement && valj) {
                const val = valj[n];
                manilo.textContent = ""+val;
                manilo.style.position = "absolute";
                manilo.style.top = "50%"; //`${this.element.offsetTop}px`;
                manilo.style.left = `${this._pozicio(val)}%`;

                manilo.onpointerdown = this.komencuMovon.bind(this);
                manilo.onpointerup = this.finuMovon.bind(this);
            };
            n++;
        });

        this.valoroj = this.opcioj.valoroj;

        // registrita ago
        if (this.opcioj.kreo instanceof Function) {
            this.opcioj.kreo();
        }
    }

    komencuMovon(event: PointerEvent) {
        const manilo = event.currentTarget;
        if (manilo instanceof HTMLElement) {
            manilo.classList.add("ui-state-active");
            manilo.onpointermove = this.movu.bind(this);
            manilo.setPointerCapture(event.pointerId);    
        }
    }
      
    finuMovon(event: PointerEvent) {
        const manilo = event.currentTarget;
        if (manilo instanceof HTMLElement) {
            manilo.classList.remove("ui-state-active");
            manilo.onpointermove = null;
            manilo.releasePointerCapture(event.pointerId);

            // registrita ago
            if (this.opcioj.postmovo instanceof Function) {
                this.opcioj.postmovo(event,this);
            }
        }
    }
      
    // por movi, vd. ekz-e
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
    // https://www.w3schools.com/howto/howto_js_draggable.asp
    movu(event: MouseEvent) {
        const manilo = event.currentTarget;
        if (manilo instanceof HTMLElement) {
            const mx = event.clientX - this.element.offsetLeft;
            const no = Array.from(this.element.children).indexOf(manilo);
            const val = this._valoro_x(mx,no);
            const p = this._pozicio(val);
            manilo.textContent = val.toFixed(0); // momente ni supozas entjerojn kun paŝoj je 1
            const mp = this._plarĝo(manilo.offsetWidth);
            manilo.style.left = `${p - mp/2}%`;
            //console.debug(`mx: ${mx} val: ${val} proc: ${p}`);

            // memoru la aktualan valoron
            this.valoroj[no] = val;
        }
    }

    /**
     * Redonas la valoron respondan al la x-pozicio mezurita de maldekstro
     * respektante minimuman kaj maksimuman limojn kaj evitante transŝovon
     * de najbaraj maniloj
     */
    _valoro_x(mx: number, no: number): number {
        const larĝo = this.element.offsetWidth;
        const min = this.opcioj.min||0;
        const max = this.opcioj.max||100;
        const vmin = no>0? this.valoroj[no-1] : min;
        const vmax = no<this.valoroj.length-1? this.valoroj[no+1] : max;
        // KOREKTU: se ni vokas tro frue offsetWith / getBoundingClientRect().width redonas 0
        const val = min + mx/larĝo*(max-min);
        return Math.min(Math.max(val,vmin),vmax);
    }

    /**
     * Redonas la pozicion respondan al la valoro en procentoj
     */
    _pozicio(val: number): number {
        const min = this.opcioj.min||0;
        const max = this.opcioj.max||100;
        // KOREKTU: se ni vokas tro frue offsetWith / getBoundingClientRect().width redonas 0
        return (val-min)/(max-min)*100; 
    }

    /**
     * Redonas la larĝo de io (manilo) en procentoj de la skallarĝo
     */
    _plarĝo(lx: number) {
        const larĝo = this.element.offsetWidth;
        return lx*100/larĝo;
    }


}