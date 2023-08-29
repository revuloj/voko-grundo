/**
 * (c) 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 */


/**
 * Stiloj uzataj en la diversaj UI-elementoj. Ni metas ilin centre por havi superrigardon.
 * Oni povas inidvidue adapti ilin per CSS.
 */
export class UIStil {
    // ĝenerale / DOM
    static kaŝita = 'kasxita'; // CSS-klaso kiun ni aplikas al kaŝitaj elementoj
    static aktiva = 'aktiva'; // CSS-klaso kiun ni aplikas al aktivaj elementoj

    // dialogoj
    static dialogo = "ui-dialog";
    static butonujo = "butonujo";
    static faldebla = "faldebla";
    static faldita = "faldita";

    // menuoj
    static menuero = "ui-menu-item";
    static menuo = "ui-menu";
    static menudividilo = "ui-menu-divider";
    static submenuo_fermita = "ui-menu-sub-fermita";

    // en sliparo
    static langetaro = "ui-tabs-nav";
    static langeto_aktiva = "ui-tabs-active";

    // skalo
    static skalo = "ui-slider";
    static skalo_horizonta = "ui-slider-horizontal"; // aldonu vertikalan okaze...!
    static manilo = "ui-slider-handle";

}