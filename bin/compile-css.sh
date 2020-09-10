#!/bin/bash

# files=$*

dir=stl
files=(\
  $dir/normalize.css \
  $dir/koloroj.css \
  $dir/piktogram-1c.css \
  $dir/artikolo-1c.css \
  $dir/redaktilo-1c.css \
  $dir/kadro-1c.css)
#files=($dir/revo-1c.css)

# malgrandigas CSS-dosieron per
# - forigo de linioj @import
# - forigo de linirompoj
# - forigo de komentoj
# - forigo de 0 antaŭ punkto 
# - forigo de komencaj kaj finaj spacoj
# - forigo de superfluaj spacoj antaŭ/post { kaj }
# - forigo de superfluaj spacoj antaŭ/post : ; ,

        #| sed -r 's/\/\*+[^*]+\*+\///g' 

for f in "${files[@]}"; 
do
    NAME=$(basename "$f")
    echo "/*$NAME*/"
    CSS=$( cat "$f" \
          | sed 's/@import.*//' \
          | tr -d '\n' \
          | sed 's,/\*,\x02,g' | sed 's,\*/,\x03,g' | sed 's/\x02[^\x03]*\x03//g' \
          | sed -r 's/([\(): ])0(\.[0-9])/\1\2/g' \
          | sed 's/^[ \t]*//;s/[ \t]*$//' \
          | sed 's/[ \t]*{[ \t]*/{/g; s/[ \t]*}[ \t]*/}/g' \
          | sed 's/[ \t]*:[ \t]*/:/g; s/[ \t]*;[ \t]*/;/g; s/[ \t]*,[ \t]*/,/g' \
        )
    echo ${CSS}
done