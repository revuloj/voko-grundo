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
            self.eo = json.eo ? group_by(1,json.eo) : undefined; // ordigu laŭ kapvorto (1 - 2a kampo)
            self.trd = json.trd ? group_by(3,json.trd) : undefined; // ordigu laŭ ind (3 - 4a kampo)
            onSuccess.call(self);
        }
    );    
};


// redoni la trovojn de unu lingvo kiel listo de objektoj
// {v - vorto, h - href, t - <trdj>} - lng = eo <trdj> estas listo de {lng,str}
// por aliaj lingvoj estas nur str (t.e. esperanta traduko)
Sercho.prototype.trovoj = function(lng) {
    function trovo_eo(kap,mrk,trdj) {
        // grupigu la tradukojn laŭ lingvo kaj kunigi ĉiuj de
        // sama lingvo per komoj...
        const t_l = Object.entries(group_by(2,trdj)).map( 
            ([lng,list]) => {
                const ero = {}
                ero[lng] = list.map((e) => e[4]||e[3]).join(', ');
                return ero;
            });
        return {
            v: kap,
            h: art_href(mrk),
            t: t_l
        }
    }
    if (lng == 'eo') {
        // ni jam grupigis laŭ kapvortoj, sed
        // la liston de trovoj/tradukoj por la sama kapvorto: [mrk,kap,lng,ind,trd] 
        // ...ni ankoraŭ grupigu laŭ mrk - ĉar povas enesti homnimoj!
        var trvj = [];
        for (let [kap,eroj] of Object.entries(this.eo)) {
            const grouped = group_by(0,eroj);
            trvj.push(...Object.keys(grouped).map(mrk=>trovo_eo(kap,mrk,grouped[mrk])));
        };
        return trvj.sort(function(a,b) {
            // ĉu localeCompare por eo funkcias ĉie, kio pri iOS, Windows...?
            return a.v.localeCompare(b.v,'eo');
        });
    }
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
