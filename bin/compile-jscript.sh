#!/bin/bash

# download closure-compiler:
# https://github.com/google/closure-compiler/releases/latest ...
# curl -LO https://dl.google.com/closure-compiler/compiler-latest.tar.gz \
#  && tar -xvzf compiler-latest.tar.gz 
# necesas nun mvn aŭ npx por ruli ĝin:
# npx ŝajnas la plej rapida voj:
# https://www.npmjs.com/package/google-closure-compiler

#java -jar closure-compiler*.jar --js_module_root jsc --entry_point revo-1b.js \
#           --js_output_file revo-compiled.js jsc/*.js

npx google-closure-compiler --js_module_root jsc --entry_point revo-1b.js \
           --js_output_file build/revo-compiled.js jsc/*.js