// sendu vorton al la serĉ-CGI kaj redonu la rezultojn grupigite kaj porciumite

function Sercho(kion) {
    //komence malplena
    this.eo = [];
    this.trd = []; 
}

Sercho.prototype.serchu = function(esprimo,onSuccess) {
    const self = this;
    HTTPRequestFull('POST', sercho_url, 
        {"Accept-Language": preferoj.languages().join(',')},
        {sercxata: esprimo},
        function(data) {
            var json = JSON.parse(data);
            self.eo = json.eo ? 
                group_by(1,json.eo)
                : undefined; // ordigu laŭ kapvorto (1 - 2a kampo)
            self.trd = json.trd ? 
                group_by(3,json.trd) 
                : undefined; // ordigu laŭ lng (3 - 4a kampo)
            onSuccess.call(self);
        }
    );    
};


// redoni la trovojn de unu lingvo kiel listo de objektoj
// {v - vorto, h - href, t - <trdj>} - lng = eo <trdj> estas objekto 
// de la formo {de: "trdj", en: "trdj"...}
// por aliaj lingvoj estas nur signaro kun esperanta traduko, do ne objekto
Sercho.prototype.trovoj = function(lng) {

    // strukturas unu e-an trovon kun unika kap-mrk
    function trovo_eo(kap,mrk,trdj) {
        // grupigu la tradukojn laŭ lingvo kaj kunigi ĉiuj de
        // sama lingvo per komoj...
        const t_l = Object.entries(
            group_by(2,trdj)) // grupigu laŭ lingvo (tria kampo)
            .reduce( (obj,[lng,list]) => {
                obj[lng] = 
                    // ĉenigu ĉiujn tradukojn de unu lingvo, se estas trd (lasta kampo)
                    // uzu tiun, ĉar ĝi estas pli longa ol ind, enhavante klarigojn ks.
                    list.map((e) => e[4]||e[3]) 
                    .join(', ');
                return obj;
            }, {} );
        return {
            v: kap,
            h: art_href(mrk),
            t: t_l
        }
    }

    // strukturas unu ne-e-an trovon kun unika ind-mrk
    function trovo_trd(ind,eroj) {
        // list transformu al paroj {k: <kapvorto>, h: href}
        const e_l = eroj.map((ero) =>
            { return {
                k: ero[1], 
                h: art_href(ero[0])
            } }
        );
        return {
            v: ind,
            t: e_l
        }
    }


    var trvj = [];
    if (lng == 'eo') {
        // ni jam grupigis laŭ kapvortoj, sed
        // la liston de trovoj/tradukoj por la sama kapvorto: [mrk,kap,lng,ind,trd] 
        // ...ni ankoraŭ grupigu laŭ mrk - ĉar povas enesti homnimoj!
        for (let [kap,eroj] of Object.entries(this.eo)) {
            const grouped = group_by(0,eroj);
            trvj.push(...Object.keys(grouped)
                .map( mrk => trovo_eo(kap,mrk,grouped[mrk]) ));
        };
        return trvj.sort((a,b) =>
            a.v.localeCompare(b.v,'eo'));

    } else {
        // la liston de trovoj/tradukoj por 
        // la elektita lingvo: [mrk,kap,num,lng,ind,trd] 
        // ...ni ankoraŭ grupigu laŭ ind
        const grouped = group_by(4,this.trd[lng]); // ni grupigas laŭ 'ind' (5a kampo)
        return Object.keys(grouped)
            .sort(new Intl.Collator(lng).compare)
            .map( ind => trovo_trd(ind,grouped[ind]) );
    }
}

// en kiuj lingvoj (krom eo) ni trovis ion?
Sercho.prototype.lingvoj = function() {
    return ( Object.keys(this.trd) );
}

Sercho.prototype.malplena = function() {
    return ( !this.eo && !this.trd );
}

Sercho.prototype.sola = function() {
    return ( Object.keys(this.eo).length + Object.keys(this.trd).length == 1 );
}

Sercho.prototype.unua = function() {
    var u;
    if ( this.eo ) {
        u = Object.keys(this.eo)[0]
    } else if ( this.trd ) {
        u = Object.keys(this.trd)[0]        
    }
    return { href: art_href(u[0]) }        
}
