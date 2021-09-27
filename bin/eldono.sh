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
release=2b
node_release=2.0.2
revo=${host}:www/revo
files=${host}:files

# ni komprenas preparo | docker | servilo kaj supozas "docker", se nenio donita argumente
# por specialaj okazoj ni povas kopii ankaŭ dosierojn el loka Revo-versio al la servilo
# per unu el artikoloj | historioj | indeksoj | fontoj
target="${1:-docker}"

JSC=build/jsc/revo-${release}-min.js
CSS=build/stl/revo-${release}-min.css

KADRO=jsc/kadro.js
PACKG=package.json

case $target in
servilo)
    # ni supozas, ke vi jam kompilis JS kaj CSS per 
    #    npm run build:js[:debug]
    #    npm run build:css
    scp ${JSC} ${revo}/jsc
    scp ${CSS} ${revo}/stl
    ;;
docker)
    araneo_id=$(docker ps --filter name=araneujo_araneo -q)
    todir=/usr/local/apache2/htdocs/revo
    docker cp ${JSC} ${araneo_id}:${todir}/jsc
    docker cp ${CSS} ${araneo_id}:${todir}/stl
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
    sed -i 's/const version="[1-9][a-z]";/const version="'${release}'";/' ${KADRO}
    sed -i 's,/revo-[1-9][a-z]-min\.,/revo-'${release}'-min\.,g' ${PACKG}
    sed -i 's/"version": "[1-9].[0-9].[1-9]"/"version": "'${node_release}'"/' ${PACKG}
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
esac
