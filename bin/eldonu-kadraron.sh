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
release=2a
revo=${host}:www/revo
files=${host}:files

# poste la plusendan index.html ni havu ankaŭ rekte sub /revo...
#scp -r build/* ${revo}/

scp -r build/jsc/revo-${release}-min.js ${revo}/jsc
scp -r build/stl/revo-${release}-min.css ${revo}/stl

## scp -r cfg/*.xml ${revo}/cfg/

#scp dtd/*.dtd ${revo}/dtd/
#scp -r xsl ${files}/


#  malnovaj...
## scp stl/artikolo.css ${revo}/stl/
## scp stl/indeksoj.css ${revo}/stl/

# scp build/* ${host}:/html/revo/
#
#
#scp build/dok/datumprotekto.html ${host}:/html/revo/dok/


# tion eble ankaŭ kopiu al build/xsl...
#
#for f in xsl/inc/*
#do
#    scp $f ${host}:/html/revo/xsl/inc/
#done

# poste ankaŭ novajn xsl-dosierojn... eble
# eldonu per aparta skripto...
