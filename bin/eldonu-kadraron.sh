#!/bin/bash

# eldonas kadrajn paĝojn, sendante ilin al la publika servilo
# tio estas iom provizora solvo, kiun necesas plibonigi poste.
#
# jen kelkaj informoj kiel eviti plurfoje doni la pasvorton por scp:
# https://linux.101hacks.com/unix/ssh-controlmaster/
# + ControlPersist 2m
# http://blogs.perl.org/users/smylers/2011/08/ssh-productivity-tips.html

host=retavortaro.de
release=1c

#scp build/jsc/revo-${release}.js ${host}:/html/revo/jsc/
#scp build/jsc/malnova-${release}.js ${host}:/html/revo/jsc/
#
#scp build/stl/revo-${release}-min.css ${host}:/html/revo/stl/
#scp build/stl/artikolo-${release}.css ${host}:/html/revo/stl/
#
##scp jsc/revo-art-${release}.js ${host}:/html/revo/jsc/
##
##scp stl/artikolo-${release}.css ${host}:/html/revo/stl/
##scp stl/piktogram-${release}.css ${host}:/html/revo/stl/
#
#
#scp build/dok/datumprotekto.html ${host}:/html/revo/dok/

#scp cfg/sercxo-google.xml ${host}:/html/revo/cfg/
#scp cfg/sercxo-ecosia.xml ${host}:/html/revo/cfg/
#scp cfg/sercxo-anaso.xml ${host}:/html/revo/cfg/
scp cfg/sercxo-revo.xml ${host}:/html/revo/cfg/

#
#for f in xsl/inc/*
#do
#    scp $f ${host}:/html/revo/xsl/inc/
#done

# poste ankaŭ novajn xsl-dosierojn... eble
# eldonu per aparta skripto...
