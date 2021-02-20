const fs = require("fs");

// legi signo-unuojn el dtd/vokosgn.dtd kaj eligu difinojn por enkodigo per Perl
const sgndtd = 'dtd/vokosgn.dtd';
const perldir = 'build/cgi/perllib/revo';
const pmout = 'voko_entities.pm';

//const re_entity = /<!ENTITY\s+([:alpha:]+)\s+"(&#x?[0-9a-fA-F]+)">/mg;
const re_entity = /<!ENTITY\s+([\w]+)\s+"&(#x?)([0-9a-fA-F]+);"/mg;

fs.readFile(sgndtd,(error,data) => {
    if (error) { throw error;}
    //console.log(data.toString());
    const pmstr = dtd2pm(data.toString());

    fs.mkdir(perldir, {recursive: true, mode: '0755'}, function(err) {
        if (err) throw err;

        fs.writeFile(perldir+'/'+pmout, pmstr, function (err) {
            if (err) throw err;
            console.log('Konservita al '+perldir+'/'+pmout);
        }); 
    });
});

function dtd2pm(dtdStr) {

    //fs.writeFile(perlout, 'Hello content!', function (err) {
    //    if (err) throw err;
    //    console.log('Saved!');
    //  }); 
    var result = 'package voko_entities; $voko_entities = (\n';
    var m = re_entity.exec(dtdStr);
    //return re_entity.exec(dtdStr);
    while (m !== null) {
        //console.log(m.index+": "+m[0]+"; 1:"+m[1]+"; 2:"+m[2]+"; 3:"+m[3]);
        console.info(m[2]+m[3] + " => " + m[1]);

        var chr;
        if (m[2] == '#x') {
            chr = String.fromCharCode(parseInt(m[3],16));
        } else if (m[2] == '#') {
            chr = String.fromCharCode(parseInt(m[3]));
        } else {
            throw "Nevalida m2: "+m[2];
        }

        const code = chr.charCodeAt(0);
        if ( code > 255 && (code < 0x2000 || code > 0x202F)) {
            result +=  "'" + chr + "' => '" + m[1] + "',\n";
        }

        m = re_entity.exec(dtdStr);
    }

    return result + ("'%' => '%');\nreturn 1;");
}

