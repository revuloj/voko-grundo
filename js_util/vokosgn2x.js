const fs = require("fs");

// legi signo-unuojn el dtd/vokosgn.dtd kaj eligu difinojn por enkodigo per Perl
const sgndtd = 'dtd/vokosgn.dtd';
const perldir = 'build/cgi/perllib/revo';
const pmout = 'voko_entities.pm';
const jsdir = 'build/jsc';
const jsout = 'voko_entities.js';

//const re_entity = /<!ENTITY\s+([:alpha:]+)\s+"(&#x?[0-9a-fA-F]+)">/mg;
const re_entity = /<!ENTITY\s+([\w-\.]+)\s+"&(#x?)([0-9a-fA-F]+);"/mg;

console.log("<- "+sgndtd+"...");
fs.readFile(sgndtd,(error,data) => {
    if (error) { throw error;}
    //console.log(data.toString());
    const entities = dtd_entities(data.toString());

    write_js(entities);

    fs.mkdir(perldir, {recursive: true, mode: '0755'}, function(err) {
        if (err) throw err;
        write_pm(entities);
    });

});

function dtd_entities(dtdStr) {

    //fs.writeFile(perlout, 'Hello content!', function (err) {
    //    if (err) throw err;
    //    console.log('Saved!');
    //  }); 
    //var result = 'package voko_entities; $voko_entities = (\n';
    var entities = [];
    var m = re_entity.exec(dtdStr);
    //return re_entity.exec(dtdStr);
    while (m !== null) {
        //console.log(m.index+": "+m[0]+"; 1:"+m[1]+"; 2:"+m[2]+"; 3:"+m[3]);
        //console.info(m[2]+m[3] + " => " + m[1]);

        var chr;
        if (m[2] == '#x') {
            chr = String.fromCharCode(parseInt(m[3],16));
        } else if (m[2] == '#') {
            chr = String.fromCharCode(parseInt(m[3]));
        } else {
            throw "Nevalida m2: "+m[2];
        }

        const code = chr.charCodeAt(0);
        if ( code > 127 && code < 0x200a 
            || code > 0x200f && code < 0x202a 
            || code > 0x202f) {
            //result +=  "'" + chr + "' => '" + m[1] + "',\n";
            entities.push([m[1],chr])
        }

        m = re_entity.exec(dtdStr);
    }

    return entities; //result + ("'%' => '%');\n1;");
}

/*
    - kreas Perlan mapon de signo al signonomo uzotan kun voko-araneo/cgi/perllib/revo/encodex.pm
    - Por enkodado estus bone ankaŭ aldoni la XML-unuojn el vokomll.dtd kaj vokourl.dtd - supozeble en
      aparta mapo, kiu aplikiĝu per anstataŭigado s/../../g 
      -> momente ni faros tion nur en la Prologa redaktilo (voko-svn/swi, voko-cetonio), kie per loaddtd.pl ni kreas voko_entities.pl

*/
function write_pm(entities) {
    const pmfile = perldir+'/'+pmout;
    console.log("-> "+pmfile+"...");

    fs.open(pmfile,'w','0644',(error,fd) => {
        if (error) { throw error; }
    
        fs.writeSync(fd,
            'package revo::voko_entities; use utf8;\n' +
            'sub entities { return \\%voko_entities; }\n' +
            '%voko_entities = (\n');

        
        for (let [nam,ent] of entities) {
            fs.writeSync(fd,
                "'" + ent + "'=>'" + nam + "',\n");
        }
        fs.writeSync(fd,"'__%'=>'__%');\n");
        fs.closeSync(fd);
    });
};

/*
- kreas JS-mapon de signonomo al signo uzotan kun redaktilo.js:load_xml()
*/
function write_js(entities) {
    const jsfile = jsdir+'/'+jsout;
    console.log("-> "+jsfile+"...");

    fs.open(jsfile,'w','0644',(error,fd) => {
        if (error) { throw error; }
    
        fs.writeSync(fd,
            '/* jshint esversion: 6 */\n' +
            'const voko_entities={\n' +
            '"amp":"&amp;",\n' +
            '"lt":"&lt;",\n' +
            '"gt":"&gt;",\n' +
            '"apos":"&apos;",\n' +
            '"quot":"&quot;",\n');
        
        for (let [nam,ent] of entities) {
            fs.writeSync(fd,
                '"'+nam+'":"'+ent+'",\n');
        }
        fs.writeSync(fd,'"__%":"__%"}\n');
        fs.closeSync(fd);
    });
}

