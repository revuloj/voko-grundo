#!/bin/bash
set +e
set +x

MP=mpost
thisdir=$(pwd)
builddir=$(pwd)/build/smb
srcdir=$(pwd)/smb

# donante unuopajn dosierojn sur komandlinio aldonu $(pwd)/ !
files=$*

if [[ -z "$files" ]]; then
    files=(${srcdir}/???.mp ${srcdir}/????.mp ${srcdir}/[ir]_*.mp)
else
    echo "Por konverti certajn dosierojn doni ilin kiel absolute kun prefikso, ekz: $(pwd)/i_*.mp"
fi

echo "FILES: ${files[@]}"

# pro cimo en mpost-PNG 1.999 ni uzis rsvg-convert
# sed nun rsvg-convert fuŝas kaj mpost-PNG denove funkcias!
#RSVG=rsvg-convert

cd ${builddir}

for file in "${files[@]}"
do
    #svg=${file%%.mp}.svg
    #echo ${MP} ${file} ${svg}
    #${MP} ${file} ${svg}
    echo ${MP} ${file} 
    ${MP} ${file} 
    #png=${file%%.mp}.png
    #echo ${RSVG} -w 100 -h 100 -o ${png} ${svg}
    #${RSVG} -w 100 -h 100 -o ${png} ${svg}
done

cd ${thisdir}
