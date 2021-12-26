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
release=2d
node_release=2.0.4
revo=${host}:www/revo
files=${host}:files

# ni komprenas preparo | docker | servilo kaj supozas "docker", se nenio donita argumente
# por specialaj okazoj ni povas kopii ankaŭ dosierojn el loka Revo-versio al la servilo
# per unu el artikoloj | historioj | indeksoj | fontoj
target="${1:-helpo}"

JSC=build/jsc/revo-${release}-min.js
CSS=build/stl/revo-${release}-min.css
RSJ=build/rsj/redaktilo-${release}-min.js
RSC=build/stl/redaktilo-${release}-min.css

KADRO=jsc/kadro.js
PACKG=package.json

case $target in
helpo)
    echo "---------------------------------------------------------------------------"
    echo "Tiu skripto servas por sendi loke preparitajn dosierojn en la docker-procezujoj"
    echo "por elprovi kaj sencimigi ilin tie."
    echo ""
    echo "(Por fina publikgo al la servilo uzu la skripton eldono.sh)"
    ;;
araneo:debug)
    npm run build:js:debug
    npm run build:css
    ;;&
araneo|araneo:debug)
    araneo_id=$(docker ps --filter name=araneujo_araneo -q)
    todir=/usr/local/apache2/htdocs/revo
    docker cp ${JSC} ${araneo_id}:${todir}/jsc
    docker cp ${CSS} ${araneo_id}:${todir}/stl
    ;;

cetonio)
    npm run build:rsj
    npm run build:rsc
    ;;&
cetonio:debug)
    npm run build:rsj:debug
    npm run build:rsc
    ;;&
cetonio|cetonio:debug)
    cetonio_id=$(docker ps --filter name=cetoniujo_cetonio -q)
    todir=/home/cetonio/pro
    docker cp ${RSJ} ${cetonio_id}:${todir}/web/static
    docker cp ${RSC} ${cetonio_id}:${todir}/web/static
    ;;
esac
