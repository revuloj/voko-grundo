import * as u from '../u';
import {agordo as g} from '../u';
import * as x from '../x';
import * as s from './shargo';
import {sercho} from './sercho';

export namespace titolo {

    export function adapto(root_el: Element) {

        // hazarda artikolo
        const hazarda = root_el.querySelector("a[id='w:hazarda']");
        if (hazarda) hazarda.addEventListener("click", function(event) {
            event.preventDefault();
            s.hazarda_art();
        });

        // adaptu serĉilon
        const s_form = root_el.querySelector("form[name='f']");
        const query = s_form?.querySelector("input[name='q']");

        if (s_form && query) {
            
            const cx = s_form.querySelector("button.cx");
            
            //var submit = s_form.querySelector("input[type='submit']");
            //s_form.removeAttribute("action");
            //submit.addEventListener("click",serchu);
            
            query.addEventListener("keydown", function(event: KeyboardEvent) {
                if (event.key == "Enter") {  
                    sercho.serchu(event);
                }
            });
            query.addEventListener("keyup",function(event: KeyboardEvent) {
                const trg = event.target as HTMLInputElement;
                const wcx = document.getElementById("w:cx") as HTMLInputElement;
                if (event.key == "x" || event.key == "Shift") { // x-klavo 
                    if (wcx.value == "1") {
                        var s = trg.value;
                        var s1 = x.ascii_eo(s);
                        if (s != s1)
                            trg.value = s1;
                    }
                }
                // keycode fix for older Android Chrome 
                else if ((event.keyCode == 0 || event.keyCode == 229) && wcx.value == "1") {
                    const s = trg.value;
                    const key = s.charAt(s.length-1);
                    //alert("Android dbg: "+event.keyCode+ "s: "+s+" kcd: "+kCd);
                    if (key == "x" || key == "X") {
                        const s1 = x.ascii_eo(s);
                        if (s != s1)
                            trg.value = s1;    
                    }
                }
            });

            if (cx) cx.addEventListener("click", function(event) {
                event.preventDefault();
                const cx = event.target as HTMLInputElement;
                cx.value = ""+(1-parseInt(cx.value)); 
                document.getElementById('w:q')?.focus();
            });

            s_form.querySelector("button[value='revo']")
                ?.addEventListener("click", function(event) {
                    event.preventDefault();
                    sercho.serchu(event);
                });

            s_form.querySelector("button[value='ecosia']")
                ?.addEventListener("click", function(event) {
                    event.preventDefault();
                    const wq = document.getElementById('w:q') as HTMLInputElement;
                    location.href = 'https://www.ecosia.org/search?q='
                        + encodeURIComponent(wq.value + ' site:reta-vortaro.de');
                });

            s_form.querySelector("button[value='anaso']")
                ?.addEventListener("click", function(event) {
                    event.preventDefault();
                    const wq = document.getElementById('w:q') as HTMLInputElement;
                    location.href = 'https://duckduckgo.com?q='
                        + encodeURIComponent(wq.value + ' site:reta-vortaro.de');
            });
        }
    }

    /**
     * Ricevas la nombrojn de kapvortoj kaj tradukoj kaj prezentas ilin en la titolpaĝo.
     */
    export function nombroj() {

        u.HTTPRequest('POST', g.nombroj_url, { x: "0" }, // sen parametroj POST ne funkcius, sed GET eble ne estus aktuala!
            function(data: string) {
                // sukceso!
                var json = 
                    /** @type { {trd: Array, kap: Array} } */
                    (JSON.parse(data));
                console.log(json);
                const n = document.getElementById('t:nombroj');
                if (n && json) {
                    // {"trd":[412630],"kap":[31291]}
                    const trd = json.trd[0];
                    const kap = json.kap[0];
                    n.prepend('Ni nun provizas '+kap+' kapvortojn kun '+trd+' tradukoj. ');
                }
            }, 
            s.start_wait,
            s.stop_wait 
        );
    }
}