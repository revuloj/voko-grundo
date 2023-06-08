#!/bin/bash

# voku svg2css.sh dosieroj..., ekz. smb/[ir]_*.svg

# la sintakso de la stilfolio konvenu al "sed". Se tio estos tro malfacila estonte, oni povas
# konsideri prepari la SVG-on per XSL-transformo
#STYLE_default='<style><\/style>'
#STYLE_dark='<style type=\"text\/css\"><![CDATA[path{stroke:lightgoldenrodyellow!important}]]><\/style>'
#STYLE_icon='<style type=\"text\/css\"><![CDATA[path{stroke:darkgreen!important}]]><\/style>'
STYLE_default=''
STYLE_dark='<style><![CDATA[path{stroke:lightgoldenrodyellow!important}]]><\/style>'
#STYLE_light='<style><![CDATA[path{stroke:black!important}]]><\/style>'
STYLE_ref='<style><![CDATA[path{stroke:chocolate!important}]]><\/style>'


files=$*

# fakte nur IE laŭdire postulas tion!
urlencode() {
    # urlencode <string>
    old_lc_collate=$LC_COLLATE
    LC_COLLATE=C

    for w in $*; do
        
        local length="${#w}"
        #echo "LEN: $length"

        for (( i = 0; i < length; i++ )); do
            local c="${w:i:1}"
            case $c in
                [a-zA-Z0-9.~_-]) printf "$c" ;;
                *) printf '%%%02X' "'$c" ;;
            esac
        done
        printf '%s' '%20'
        #printf '%s' '+'
    done

    LC_COLLATE=$old_lc_collate
}

pics() {
  local style=$1
  shift 1

  for f in $files
  do
    NAME=$(basename "$f" .svg)

    #if [[ "$NAME" == r_* ]]; then
    #  STYLE="$STYLE_ref"
    #else
    #  STYLE="$style"
    #fi
    STYLE="$style"

    # Ni adaptas SVG kiel sekve:
    # - forigi XML process-instrukcioj <?...?>
    # - forigi XML-komentojn <!-- ... -->
    # - forigi with/height kaj enŝovi stildifinoj por kolorigo
    # - forigi tro detalajn decimal-ciferojn - dekonoj sufiĉas
    # - forigi linirompojn
    # - forigi spacsignojn en la komenco kaj fino
    
    STR=$(cat "$f" | sed 's/<?.*?>//' | sed 's/<!--.*-->//' \
          | sed -re "s/(<svg.*) width=\"[0-9\.]+\" height=\"[0-9\.]+\"(.*>)/\1\2${STYLE}/" \
          | sed -r 's/(\.[0-9])[0-9]+/\1/g' \
          | tr -d '\n' | sed 's/^[ \t]*//;s/[ \t]*$//' )
          #| sed -re 's/(<svg.*) height=".*"/\1/' | tr '\012' ' ')
    
    # fakte nur IE laŭdire postulas tion!
    STR=$(urlencode $STR) 
    #echo $STR
    
    cat <<EOP
  .$NAME {
    background: 
      url('data:image/svg+xml;utf8,$STR')
      no-repeat;	
  }
EOP

  #  background-size: contain;
  #  background-position: center;

  done
}

pics "$STYLE_default" $*
echo "@media (prefers-color-scheme: dark) {"
pics "$STYLE_dark" $*
echo "}"
