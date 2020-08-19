#!/bin/bash

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

# forigu: 
# <?xml version="1.0"?>
# <!-- ... -->
# width="..." height="..."

STR=$(sed 's/<?.*?>//' | sed 's/<!--.*-->//' | \
      sed -re 's/(<svg.*) width="[0-9\.]+" height="[0-9\.]+"/\1/' | tr '\012' ' ')
      #| sed -re 's/(<svg.*) height=".*"/\1/' | tr '\012' ' ')

#urlencode $STR

echo $STR