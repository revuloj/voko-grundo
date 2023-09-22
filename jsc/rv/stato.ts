import {Transiroj} from '../u/transiroj';
import {DOM} from '../ui';
import * as x from '../x';
import {agordo as g} from '../u';

import {ŝargu_paĝon} from './shargo';
import {titolo} from './p_titolo';
import {redaktilo} from './redaktilo';
import * as preferoj from './redk_pref';
import * as submeto from './redk_submeto';

/**
 * Statoj kaj transiroj - ni uzas tri diversajn statomaŝinojn por la tri paĝoj navigilo, ĉefpago kaj redaktilo
 */
export const t_nav  = new Transiroj("nav","start",["ĉefindekso","subindekso","serĉo","redaktilo"]);
export const t_main = new Transiroj("main","start",["titolo","artikolo","red_xml","red_rigardo"]);
export const t_red  = new Transiroj("red","ne_redaktante",["ne_redaktante","redaktante","tradukante","sendita"]);


export function stato_difinoj() {
    //// PLIBONIGU: provizore limigu Transiroj-n al memorado de la momenta stato
    //// kaj adapto de videbleco / stato de butonoj.
    //// Rezignu pri tro komplikaj agoj kiel ŝargi paĝojn (kelkaj esceptoj malsupre) ktp. (?)

    t_nav.alvene("ĉefindekso",()=>{ 
        if (t_main.stato != "titolo") DOM.malkaŝu("#x\\:titol_btn");

        DOM.kaŝu("#x\\:nav_start_btn");
        // viaj_submetoj(); -- ĉe renovigado tio venus tro frue kaj reforiĝus....
    });

    t_nav.forire("ĉefindekso",()=>{ 
        x.hide("x:titol_btn");
        x.show("x:nav_start_btn");
    });

    t_nav.alvene("redaktilo", ()=>{ 
        // metu buton-surskribon Rezignu kaj malaktivigu la aliajn du
        if (t_red.stato == "redaktante") {
                // ĉe sendita ne jam montru, sed eble tio eĉ en povus okazi?
            const rzg = document.getElementById("r:rezignu");
            if (rzg) rzg.textContent = "Rezignu"; 
            x.enable("r:kontrolu"); 
            x.enable("r:konservu");

            // se ni revenas al redaktado post portempa forlaso
            // ni devos adapti la butonon laŭ t_main
            // ĉar ĝi ne ŝanĝiĝas kaj do ne mem kaŭzas la adapton
            if (t_main.stato == "red_xml") {
                x.hide("x:redakt_btn");
                x.show("x:rigardo_btn");
            } else if (t_main.stato == "red_rigardo") {
                x.show("x:redakt_btn");
                x.hide("x:rigardo_btn");
            }
        }
    });

    t_nav.forire("redaktilo",()=>{ 
        x.hide("x:rigardo_btn");
        // se ni ankoraŭ redaktas, ni bezonas butonon por reveni al la redaktilo!
        if (t_red.stato == "redaktante") {
            x.show("x:redakt_btn");
        }
    });

    t_main.alvene("titolo",()=>{ 
       x.hide("x:titol_btn");
       titolo.nombroj();
    });

    t_main.forire("titolo",()=>{ 
        if (t_nav.stato == "ĉefindekso") 
            x.show("x:titol_btn");
    });

    // difinu agojn por transiroj al cel-statoj
    //t_main.alvene("titolo",()=>{ ŝargu_paĝon("main",titolo_url) });
    t_main.alvene("red_xml",()=>{
        //console.trace();
        t_red.transiro("redaktante"); // transiro al ne_redaktante okazas ĉe sendo aŭ rezigno!
        x.show("r:tab_txmltxt",'collapsed');
        x.show("x:rigardo_btn"); 
        x.hide("x:redakt_btn"); 
        /***
         * se ne videbla...?:
            ŝargu_paĝon("nav",redaktmenu_url);
            index_spread();
         */    
    });
    t_main.forire("red_xml",()=>{ 
        x.hide("r:tab_txmltxt",'collapsed');
        x.hide("x:rigardo_btn"); 
        // tiu servos por reveni al la redaktilo
        // ĝis ni definitive finis redaktadon!
        if (t_red.stato == "redaktante") 
            x.show("x:redakt_btn"); 
    });
    t_main.alvene("red_rigardo",()=>{ 
        x.show("r:tab_trigardo",'collapsed');
        x.show("x:redakt_btn"); 
        submeto.rantaurigardo();
    });
    t_main.forire("red_rigardo",()=>{ 
        x.hide("r:tab_trigardo",'collapsed');
    });

    t_red.forire("redaktante",()=>{
        // memoru enhavon de kelkaj kampoj de la redaktilo
        preferoj.store_preferences();

        x.hide("x:redakt_btn");
        x.hide("x:rigardo_btn");
    });

    /*
    t_red.alvene("tradukante",()=>{
        show("r:tab_tradukoj",'collapsed');
        // tion ni faru verŝajne pli bone en forire("redaktante"), ĉu?
        // hide("r:tab_txmltxt",'collapsed');
    });
    */

    t_red.alvene("ne_redaktante",()=>{
        // ni devos fari tion en "alvene", ĉar
        // ŝargu_paĝon kontrolas t_red.stato por scii ĉu montri "x:redakt_btn"
        ŝargu_paĝon("main",g.titolo_url); // ĉu pli bone la ĵus redaktatan artikolon - sed povus konfuzi pro malapero de ŝangoj?
        ŝargu_paĝon("nav",g.inx_eo_url);
    });

    t_red.alvene("sendita",()=>{
        // ŝanĝu tekston al nurlege
        const xt = document.getElementById("r:xmltxt");
        if (xt) xt.setAttribute("readonly","readonly");
        // ŝanĝu buton-surskribon Rezignu->Finu kaj aktivigu la aliajn du 
        const rzg = document.getElementById("r:rezignu");
        if (rzg) rzg.textContent = "Finu"; 
        x.disable("r:kontrolu"); 
        x.disable("r:konservu"); 
    });

}