#!/bin/bash

# preparu CSS de piktogramoj el SVG
svgdir=$(pwd)/build/smb
#stldir=$(pwd)/build/stl
dir=stl
ver=2h
out=$(pwd)/build/stl/revo-${ver}-min.css

# Wiki-SVG ni provizore donas rekte en artikolo-1x.css
#cp smb/i_wiki.svg ${svgdir}

# kunigu SVG-grafikojn en CSS-dosiero
bin/svg2css.sh ${svgdir}/[ir]_*.svg > ${dir}/piktogram-${ver}.css 

# files=$*

files=(\
  $dir/normalize.css \
  $dir/koloroj.css \
  $dir/piktogram-${ver}.css \
  $dir/formularo.css \
  $dir/kadro-${ver}.css \
  $dir/artikolo-${ver}.css \
  $dir/redaktilo-${ver}.css)
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
echo "Kreante $out..."
echo "" >$out

for f in "${files[@]}"; 
do
    NAME=$(basename "$f")
    echo "  <- $NAME"
    echo "/*$NAME*/" >>$out
    CSS=$( cat "$f" \
          | sed 's/@import.*//' \
          | tr -d '\n' \
          | sed 's,/\*,\x02,g' | sed 's,\*/,\x03,g' | sed 's/\x02[^\x03]*\x03//g' \
          | sed -r 's/([\(): ])0(\.[0-9])/\1\2/g' \
          | sed 's/^[ \t]*//;s/[ \t]*$//' \
          | sed -r 's/[ \t]*([{}:;,])[ \t]*/\1/g' \
        )
    echo ${CSS} >>$out
done

# kopiu ankaŭ stilfolion por la artikolo, por unuope montri ĝin
echo $(pwd)/build/stl/
echo "  <- artikolo-${ver}.css"
cp $dir/artikolo-${ver}.css $(pwd)/build/stl/


      
# kopiu al procezujo "araneujo", se tiu estas aktiva... 
if [[ $(command -v docker) ]]; then
  araneo_id=$(docker ps --filter name=araneujo_araneo -q)
  target=/usr/local/apache2/htdocs/revo/stl

  if [[ ! -z "$araneo_id" ]]; then
    echo "kopiante ${out} kaj artikolo-${ver}.css"
    echo "al ${araneo_id}:${target}"

    docker cp ${out} ${araneo_id}:${target}
    docker cp $(pwd)/build/stl/artikolo-${ver}.css ${araneo_id}:${target}
    docker exec ${araneo_id} bash -c "chown root.root ${target}; ls -l ${target}"
  fi
fi