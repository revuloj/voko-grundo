#!/bin/bash
set +e
set +x

MP=mpost

# pro cimo en mpost-PNG 1.999 ni uzis rsvg-convert
# sed nun rsvg-convert fuŝas kaj mpost-PNG denove funkcias!
#RSVG=rsvg-convert

cd smb

for file in ???.mp ????.mp [ir]_*.mp
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

cd ..
