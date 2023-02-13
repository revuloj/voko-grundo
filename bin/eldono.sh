#!/bin/bash

# eldonas kadrajn paĝojn, sendante ilin al la publika servilo
# tio estas iom provizora solvo, kiun necesas plibonigi poste.
#
# jen kelkaj informoj kiel eviti plurfoje doni la pasvorton por scp:
# https://linux.101hacks.com/unix/ssh-controlmaster/
# + ControlPersist 2m
# http://blogs.perl.org/users/smylers/2011/08/ssh-productivity-tips.html

#host=retavortaro.de
# aldonu en /etc/hosts!
host=revo
release=2g
node_release=2.0.7
revo=${host}:www/revo
files=${host}:files

# ni komprenas preparo | docker | servilo kaj supozas "docker", se nenio donita argumente
# por specialaj okazoj ni povas kopii ankaŭ dosierojn el loka Revo-versio al la servilo
# per unu el artikoloj | historioj | indeksoj | fontoj
target="${1:-helpo}"

JSC=build/jsc/revo-${release}-min.js
CSS=build/stl/revo-${release}-min.css

GLOBAL=jsc/u/global.js
PACKG=package.json

case $target in
servilo)
    # ĉu ni supozu, ke ni jam kompilis JS kaj CSS ...? 
    npm run build:js
    npm run build:css
    scp ${JSC} ${revo}/jsc
    scp ${CSS} ${revo}/stl
    ;;
preparo)
    # kontrolu ĉu la branĉo kongruas kun la agordita versio
    branch=$(git symbolic-ref --short HEAD)
    if [ "${branch}" != "${release}" ]; then
        echo "Ne kongruas la branĉo (${branch}) kun la eldono (${release})"
        echo "Agordu la variablon 'release' en tiu ĉi skripto por prepari novan eldonon."
        exit 1
    fi

    echo "Aktualigante skriptojn al nova eldono ${release}..."
    sed -i 's/globalThis.eldono = "[1-9][a-z]";/globalThis.eldono = "'${release}'";/' ${GLOBAL}
    sed -i 's,/revo-[1-9][a-z]-min\.,/revo-'${release}'-min\.,g' ${PACKG}
    sed -i 's,/redaktilo-[1-9][a-z]-min\.,/redaktilo-'${release}'-min\.,g' ${PACKG}
    sed -i 's/"version": "[1-9].[0-9].[1-9]"/"version": "'${node_release}'"/' ${PACKG}
    ;;
kreo)
    echo "Kreante lokan procezujon (por docker) voko-grundo"
    docker build -t voko-grundo .
    ;;    
etikedo)
    echo "Provizante la aktualan staton per etikedo (git tag) v${release}"
    echo "kaj puŝante tiun staton al la centra deponejo"
    git tag -f v${release} && git push && git push --tags -f
    ;;
xsl)
    # kopiu ĉiujn xsl-dosierojn donitaj sur komandlinio (ekde dua argumento) al la servilo
    scp "${@:2}" ${files}/xsl/
    ;;     
xsl-inc)
    # kopiu ĉiujn xsl-dosierojn donitaj sur komandlinio (ekde dua argumento) al la servilo
    scp "${@:2}" ${files}/xsl/inc/
    ;;
smb)
    # kopiu ĉiujn smb-dosierojn donitaj sur komandlinio (ekde dua argumento) al la servilo
    scp "${@:2}" ${revo}/smb/
    ;;    
artikoloj)
    # kopiu ĉiujn artikolojn donitaj sur komandlinio (ekde dua argumento) al la servilo
    scp "${@:2}" ${revo}/art/
    ;;
historioj)
    # kopiu ĉiujn historiojn donitaj sur komandlinio (ekde dua argumento) al la servilo
    scp "${@:2}" ${revo}/hst/
    ;;
indeksoj)
    # kopiu ĉiujn indeksojn donitaj sur komandlinio (ekde dua argumento) al la servilo
    scp "${@:2}" ${revo}/inx/
    ;;
fontoj)
    # kopiu ĉiujn XML-fontojn donitaj sur komandlinio (ekde dua argumento) al la servilo
    scp "${@:2}" ${revo}/xml/
    ;;
helpo | *)
    echo "---------------------------------------------------------------------------"
    echo "Tiu skripto servas por publikigi dosierojn loke preparitajn en la servilo."
    echo "Tiucele ekzistas celoj 'servilo', 'artikoloj', 'historioj', 'indeksoj', 'fontoj'."
    echo ""
    echo "Per la aparta celo 'preparo' oni povas krei git-branĉon kun nova eldono por tie "
    echo "komenci programadon de novaj funkcioj, ŝanĝoj ktp. Antaŭ adaptu en la kapo de ĉi-skripto"
    echo "la variablojn 'release' kaj 'node_release' al la nova eldono."
    echo "Per la celo 'etikedo' vi provizas aktualan staton per 'git tag', necesa por "
    echo "ke kompiliĝu ĉe Github nova eldono de procezujo 'docker' kiel bazo por Cetonio kaj Araneo."
    ;;    
esac
