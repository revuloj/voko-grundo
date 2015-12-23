// Farite de Bart Demeyere por ReVo
// GNU-licenco

var UnuajRezultoj='';
var DuajRezultoj='';
var LastajRezultoj='';
var UnuaRezultoDosiero='';
var UnuaRezultoLoko='';
var RE_Sercxata;
var RE_Sercxata_Nur;
var RE_Sercxata_MezaVorto;
var RE_Sercxata_KomencaVorto;
var RE_Sercxata_FinaVorto;
var RE_HavasSpecialajxon;
var RE_UCx;
var RE_UGx;
var RE_UHx;
var RE_UJx;
var RE_USx;
var RE_UUx;
var RE_Ucx;
var RE_Ugx;
var RE_Uhx;
var RE_Ujx;
var RE_Usx;
var RE_Uux;
var RE_Spaceto;
var RE_KomoSpaceto;
var RE_KomencasPerLitero;
var RE_Nevortkomenco;
var RE_Nevortfino;
function Inicu(Sercxata)
{
  RE_Sercxata = new RegExp(Sercxata, "i");
  RE_Sercxata_Nur = new RegExp("^[ -/]*"+Sercxata+"[ -/]*$","i");
  RE_Sercxata_MezaVorto = new RegExp("[ -/]"+Sercxata+"[ -/]","i");
  RE_Sercxata_KomencaVorto = new RegExp("^[ -/]*"+Sercxata+"[ -/]","i");
  RE_Sercxata_FinaVorto = new RegExp("[ -/]"+Sercxata+"[ -/]*$","i");
  RE_HavasSpecialajxon = new RegExp("[^!-~]");
  RE_UCx = new RegExp(String.fromCharCode(0x108),"g");
  RE_UGx = new RegExp(String.fromCharCode(0x11C),"g");
  RE_UHx = new RegExp(String.fromCharCode(0x124),"g");
  RE_UJx = new RegExp(String.fromCharCode(0x134),"g");
  RE_USx = new RegExp(String.fromCharCode(0x15C),"g");
  RE_UUx = new RegExp(String.fromCharCode(0x16C),"g");
  RE_Ucx = new RegExp(String.fromCharCode(0x109),"g");
  RE_Ugx = new RegExp(String.fromCharCode(0x11D),"g");
  RE_Uhx = new RegExp(String.fromCharCode(0x125),"g");
  RE_Ujx = new RegExp(String.fromCharCode(0x135),"g");
  RE_Usx = new RegExp(String.fromCharCode(0x15D),"g");
  RE_Uux = new RegExp(String.fromCharCode(0x16D),"g");
  RE_Spaceto = new RegExp(" ","g");
  RE_KomoSpaceto = new RegExp(",  *","g");
  RE_KomencasPerLitero = new RegExp("^[A-Za-z]");
  RE_Nevortkomenco = new RegExp("^\W*");
  RE_Nevortfino = new RegExp("\W*$");
}

function Ekzamenu(Eroj, Sercxata, Poz, Eo, KunTraduko, EnEsperanto)
{
  for(j=0;j<Eroj.length;++j)
  {
    var MaksEroj = Eroj[j].length;
    for(i=0;i<MaksEroj - 1;i+=2+Eo)
    {
      var Esprimo = Eroj[j][i + Poz];
      WordPos = Esprimo.search(RE_Sercxata);
      if (WordPos > -1)
      {
        Trovis(Esprimo, Eroj[j], i, Sercxata, Poz, Eo, KunTraduko, EnEsperanto);
      }
    }
  }
}

function Trovis(Esprimo, ErojJ, i, Sercxata, Poz, Eo, KunTraduko, EnEsperanto)
{
  Trovita=Esprimo.match(RE_Sercxata)[0];
  var Rezulto = '';
  if (KunTraduko)
  {
    if (EnEsperanto)
    {
      Rezulto=ErojJ[i + Eo - 1];
    }
    else
      Rezulto=Esprimo.replace(new RegExp(Trovita,"g"),Trovita.bold());
    Rezulto += ": ";
  }
  Rezulto += "<a class='l' href='../art/";
  var Marko = ErojJ[i + Eo + 1];
  var Dosiero;
  var Loko = '';
  if (Marko == '' || !RE_KomencasPerLitero.test(Marko))
  {
    var Vorto = ErojJ[i + Eo];
    if (RE_HavasSpecialajxon.test(Vorto))
      Vorto = Vorto
        .replace(RE_UCx, "Cx").replace(RE_Ucx, "cx")
        .replace(RE_UGx, "Gx").replace(RE_Ugx, "gx")
        .replace(RE_UHx, "Hx").replace(RE_Uhx, "hx")
        .replace(RE_UJx, "Jx").replace(RE_Ujx, "jx")
        .replace(RE_USx, "Sx").replace(RE_Usx, "sx")
        .replace(RE_UUx, "Ux").replace(RE_Uux, "ux");
    Vorto = Vorto.replace(RE_KomoSpaceto, ",").replace(RE_Spaceto, "_")
      .replace(RE_Nevortkomenco, '').replace(RE_Nevortfino, '');
    Dosiero = Vorto.substr(0,Vorto.length-1);
    var Dosierfino = '';
    var KunMarko = true;
    var Longeco = 0;
    var Majusklo = false;
    var Minusklo = false;
    var Pliprecizigo = '';
    var PosEnVorto = 0;
    var Pos = 0;
    while (Pos < Marko.length)
    {
      switch (Marko.charAt(Pos))
      { 
        case '!':
          KunMarko = false;
          break;
        case '}':
          KunMarko = false;
        case ']':
          if (Dosiero.length > 6)
            Dosiero = Dosiero.substr(0,6);
          break;
        case '^':
          Majusklo = true;
          break;
        case '_':
          Minusklo = true;
          break;
        case '~':
          Pliprecizigo = '.' + Marko.substr(Pos + 1, Marko.length - Pos - 1);
          Pos = Marko.length;
          break;
        default:
          if (Marko.charAt(Pos) >= '0' && Marko.charAt(Pos) <= '9')
          {
            if (Dosiero.length > 6)
              Dosiero = Dosiero.substr(0,6);
            Dosierfino += Marko.charAt(Pos);
          }
          else
          {
            var Nombro = 0;
            if (Marko.charAt(Pos) == '>')
            {
              Nombro += 13;
              ++Pos;
            }
            Nombro += Marko.charCodeAt(Pos) - '#'.charCodeAt(0);
            if (Longeco == 0)
              Longeco = Nombro + 2;
            else
              PosEnVorto = Nombro;
            Dosiero = Vorto.substr(PosEnVorto, Longeco);
          }
      }
      ++Pos;
    }
    Dosiero = Dosiero.toLowerCase() + Dosierfino;
    if (KunMarko)
    {
      if (Longeco == 0)
        Longeco = Vorto.length - 1;
      if (Longeco == 0 && !Majusklo && !Minusklo)
        Vorto = '0' + Vorto.substr(Longeco, 1);
      else
      {
        var Radiko = Vorto.substr(PosEnVorto, Longeco);
        if (Majusklo)
        {
          if (Radiko.length > 1 && Radiko.charAt(1) == 'x')
            Vorto = Vorto.replace(
              new RegExp(Radiko.charAt(0).toLowerCase()+Radiko.substr(1), "g"),
                Radiko.charAt(0).toLowerCase() + "x0");
          else
            Vorto = Vorto.replace(
              new RegExp(Radiko.charAt(0).toLowerCase()+Radiko.substr(1), "g"),
                Radiko.charAt(0).toLowerCase() + "0");
        }
        else if (Minusklo)
        {
          if (Radiko.length > 1 && Radiko.charAt(1) == 'x')
            Vorto = Vorto.replace(
              new RegExp(Radiko.charAt(0).toUpperCase()+Radiko.substr(1), "g"),
                Radiko.charAt(0).toUpperCase() + "x0");
          else
            Vorto = Vorto.replace(
              new RegExp(Radiko.charAt(0).toUpperCase()+Radiko.substr(1), "g"),
                Radiko.charAt(0).toUpperCase() + "0");
        }
        Vorto = Vorto.replace(
          new RegExp(Radiko, "g"), "0");
      }
      Loko = Dosiero + '.' + Vorto + Pliprecizigo;
    }
  }
  else
  {
    var Punkto = Marko.indexOf('.');
    if (Punkto == -1)
      Dosiero = Marko;
    else
    {
      Dosiero = Marko.substr(0, Punkto);
      Loko = Marko;
    }
  }
  Rezulto += Dosiero + ".html";
  if (Loko != '') Rezulto += "#" + Loko;
  Rezulto += "' target='precipa'>";
  if (EnEsperanto)
    Rezulto += ErojJ[i + Eo].replace(
      new RegExp(Trovita,"g"),Trovita.bold());
  else
    Rezulto += ErojJ[i + Eo];
  Rezulto += "</a><br>\n";
  if (Esprimo.search(RE_Sercxata_Nur) > -1)
  {
    UnuajRezultoj += Rezulto;
    if (UnuaRezultoDosiero == '')
    { UnuaRezultoLoko = Loko;
      UnuaRezultoDosiero = Dosiero;
    }
  }
  else if (
      RE_Sercxata_MezaVorto.test(Esprimo)
      || RE_Sercxata_KomencaVorto.test(Esprimo)
      || RE_Sercxata_FinaVorto.test(Esprimo))
    DuajRezultoj += Rezulto;
  else
    LastajRezultoj += Rezulto;
}

function Sercxu(Sercxata)
{
  var LokalaUnuaParto = UnuaParto;
  if(Sercxata.length>=1)
  {
    this.status="Laborante, bonvolu atendi...";
    Sercxata = Sercxata.toLowerCase();
    Inicu(Sercxata);
    Ekzamenu(Eroj, Sercxata, 0, 1, true, false);
    var Rezultoj = UnuajRezultoj + DuajRezultoj + LastajRezultoj;
    if(Rezultoj == '')
    { Rezultoj="<CENTER><U>Neniu rezulto trovita!</U></CENTER>\n"; }
    var LokaUnuaRezultoDosiero=UnuaRezultoDosiero;
    var LokaUnuaRezultoLoko=UnuaRezultoLoko;
    this.document.open();
    this.document.write(LokalaUnuaParto+Rezultoj+"</BODY></HTML>");
    this.document.close();
    if (LokaUnuaRezultoDosiero != '')
      open("../art/"+LokaUnuaRezultoDosiero+".html#"
        +LokaUnuaRezultoLoko, "precipa");
    this.status="Finite";
  }
  else
  { this.status="Eraro: Vi devas skribi almenau unu literon!"; }
}

function SercxuEo(Sercxata)
{
  var LokalaUnuaParto = UnuaParto;
  if(Sercxata.length>=1)
  {
    this.status="Laborante, bonvolu atendi...";
    Sercxata = Sercxata.toLowerCase();
    Sercxata = Sercxata.replace(/cx/g, "\u0109")
      .replace(/gx/g, "\u011D").replace(/hx/g, "\u0125")
      .replace(/jx/g, "\u0135").replace(/sx/g, "\u015D")
      .replace(/ux/g, "\u016D");
    Inicu(Sercxata);
    Ekzamenu(Eroj, Sercxata, 1, 1, true, true);
    Ekzamenu(Eo, Sercxata, 0, 0, false, true);
    var Rezultoj = UnuajRezultoj + DuajRezultoj + LastajRezultoj;
    var LokaUnuaRezultoDosiero=UnuaRezultoDosiero;
    var LokaUnuaRezultoLoko=UnuaRezultoLoko;
    if(Rezultoj == '')
    { Rezultoj="<CENTER><U>Neniu rezulto trovita!</U></CENTER>\n"; }
    this.document.open();
    this.document.write(LokalaUnuaParto+Rezultoj+"</BODY></HTML>");
    this.document.close();
    if (LokaUnuaRezultoDosiero != '')
      open("../art/"+LokaUnuaRezultoDosiero+".html#"
        +LokaUnuaRezultoLoko, "precipa");
    this.status="Finite";
  }
  else
  { this.status="Eraro: Vi devas skribi almenau unu literon!"; }
}
