#!/bin/bash

# voku svg2css.sh dosieroj...

# la sintakso dfe la stilfolio konvenu al "sed". Se tio estos tro malfacila estonte, oni povas
# konsideri prepari la SVG-on per XSL-transformo
STYLE='<style type=\"text\/css\"><![CDATA[path{stroke:darkgreen!important}]]><\/style>'

urlencode() {
    # urlencode <string>
    old_lc_collate=$LC_COLLATE
    LC_COLLATE=C
    
    local length="${#1}"
    for (( i = 0; i < length; i++ )); do
        local c="${1:i:1}"
        case $c in
            [a-zA-Z0-9.~_-]) printf "$c" ;;
            *) printf '%%%02X' "'$c" ;;
        esac
    done
    
    LC_COLLATE=$old_lc_collate
}

for f in $*
do

  # forigu: 
  # <?xml version="1.0"?>
  # <!-- ... -->
  # width="..." height="..."

  NAME=$(basename "$f" .svg)
  
  STR=$(cat "$f" | sed 's/<?.*?>//' | sed 's/<!--.*-->//' | \
        sed -re "s/(<svg.*) width=\"[0-9\.]+\" height=\"[0-9\.]+\"(.*>)/\1\2${STYLE}/" \
        | tr -d '\n' | sed 's/^[ \t]*//;s/[ \t]*$//' )
        #| sed -re 's/(<svg.*) height=".*"/\1/' | tr '\012' ' ')
  
  #STR=$(urlencode $STR) 
  #echo $STR
  
  cat <<EOP
.$NAME {
    background: 
      url('data:image/svg+xml;utf8,$STR')
      no-repeat;	
    background-size: contain;
}
EOP

done