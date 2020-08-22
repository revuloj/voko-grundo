#!/bin/bash

# eldonas kadrajn paĝojn, sendante ilin al la publika servilo
# tio estas iom provizora solvo, kiun necesas plibonigi poste.
#
# jen kelkaj informoj kiel eviti plurfoje doni la pasvorton por scp:
# https://linux.101hacks.com/unix/ssh-controlmaster/
# + ControlPersist 2m
# http://blogs.perl.org/users/smylers/2011/08/ssh-productivity-tips.html

host=retavortaro.de
release=1b

scp jsc/revo-art-${release}.js ${host}:/html/revo/jsc/

scp stl/artikolo-${release}.css ${host}:/html/revo/stl/
scp stl/piktogram-${release}.css ${host}:/html/revo/stl/

# poste ankaŭ novajn xsl-dosierojn... eble
# eldonu per aparta skripto...
