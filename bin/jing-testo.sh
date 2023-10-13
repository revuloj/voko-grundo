#!/bin/bash

# testas la sekmon den dtd/vokoxml.rnc kun iu Revo-artikolo, kiun vi donu en la komandlinio
# Necesas, ke vi instalis "jing" en via sistemo (vd https://relaxng.org/jclark/jing.html, https://github.com/relaxng/jing-trang)

jing -c dtd/vokoxml.rnc $1