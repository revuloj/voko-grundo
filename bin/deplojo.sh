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
release=2h
node_release=2.0.8
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

DTD="dtd/*.dtd"
XSL_INC="xsl/inc/*.xsl"
XSL="xsl/revo*.xsl"
INXXSL="xsl/inx_*.xsl"

KADRO=jsc/kadro.js
PACKG=package.json

case $target in
araneo)
    npm run build:js
    npm run build:css
    ;;&
araneo:debug)
    npm run build:js:debug
    npm run build:css
    ;;&
araneo|araneo:debug)
    araneo_id=$(docker ps --filter name=araneujo_araneo -q)
    todir=/usr/local/apache2/htdocs/revo
    echo "kopiante JS+CSS al ${araneo_id}:${todir}..."
    docker cp -q ${JSC} ${araneo_id}:${todir}/jsc
    docker cp -q ${CSS} ${araneo_id}:${todir}/stl
    ;;
araneo-dtd)
    araneo_id=$(docker ps --filter name=araneujo_araneo -q)
    todir=/usr/local/apache2/htdocs/revo/dtd
    echo "kopiante DTD al ${araneo_id}:${todir}..."
    for file in ${DTD}; do
        echo ${file}
        docker cp ${file} ${araneo_id}:${todir}
    done
    ;;    
araneo-xsl)
    araneo_id=$(docker ps --filter name=araneujo_araneo -q)
    xsldir=/hp/af/ag/ri/files/xsl
    incdir=/hp/af/ag/ri/files/xsl/inc
    echo "kopiante XSL-dosierojn al ${araneo_id}:${xsldir}..."
    for file in ${XSL}; do
        echo ${file}
        docker cp ${file} ${araneo_id}:${xsldir}
    done
    echo "kopiante XSL-dosierojn al ${araneo_id}:${incdir}..."
    for file in ${XSL_INC}; do
        echo ${file}
        docker cp ${file} ${araneo_id}:${incdir}
    done
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
    echo "kopiante ${RSJ} kaj ${RSC} al ${cetonio_id}:${todir}/web/static"
    docker cp ${RSJ} ${cetonio_id}:${todir}/web/static
    docker cp ${RSC} ${cetonio_id}:${todir}/web/static
    ;;
cetonio-xsl)
    cetonio_id=$(docker ps --filter name=cetoniujo_cetonio -q)
    xsldir=/home/cetonio/voko/xsl
    incdir=/home/cetonio/voko/xsl/inc
    echo "kopiante XSL-dosierojn al ${cetonio_id}:${xsldir}..."
    for file in ${XSL}; do
        echo ${file}
        docker cp ${file} ${cetonio_id}:${xsldir}
    done
    echo "kopiante XSL-dosierojn al ${cetonio_id}:${incdir}..."
    for file in ${XSL_INC}; do
        echo ${file}
        docker cp ${file} ${cetonio_id}:${incdir}
    done
    ;;        
formiko-xsl)
    formiko_id=$(docker ps --filter name=formikujo_formiko -q)
    xsldir=/home/formiko/voko/xsl
    incdir=/home/formiko/voko/xsl/inc
    echo "kopiante XSL-dosierojn al ${formiko_id}:${xsldir}..."
    for file in ${XSL} ${INXXSL}; do
        echo ${file}
        docker cp ${file} ${formiko_id}:${xsldir}
    done
    echo "kopiante XSL-dosierojn al ${formiko_id}:${incdir}..."
    for file in ${XSL_INC}; do
        echo ${file}
        docker cp ${file} ${formiko_id}:${incdir}
    done
    ;;        
manlibro)
    echo "aktuligi RNC-manlibron..."
    perl perl/rnc2md.pl > ../revuloj.github.io/_temoj/rnc.md
    ;;
*)    
    echo "Nevalida celo, enrigaru ĉi-skripton por vidi la eblajn celojn, ekz-e araneo:debug)"    
    ;;&
helpo|*)
    echo "---------------------------------------------------------------------------"
    echo "Tiu ĉi skripto servas por sendi loke preparitajn dosierojn"
    echo "en la docker-procezujojn, por elprovi kaj sencimigi ilin tie."
    echo ""
    echo "(Por fina publikgo al la servilo uzu la skripton eldono.sh)"
    ;;
esac
