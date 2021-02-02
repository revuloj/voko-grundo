# Vi povas krei JS+CSS per
#   docker build -t voko-grundo .
# poste vi povas elpreni ĝin per
#   docker run -it voko-grundo bash
#   docker ps
#   docker cp <cnt-id>:build/css/.. ./tmp/
#
# au uzi la tutan ujon ene de alia per:
# FROM voko-grundo as source
# FROM xyz
# COPY --from=source build/ ./


#######################################################
# staĝo 1: Ni bezonas TeX kaj metapost por konverti simbolojn al png
#######################################################
#FROM silkeh/latex:small as metapost
#LABEL Author=<diestel@steloj.de>
#
#ARG VG_BRANCH=master
#
#COPY mp2png.sh .
#RUN apk --update add curl unzip librsvg --no-cache && rm -f /var/cache/apk/* 
#RUN curl -LO https://github.com/revuloj/voko-grundo/archive/${VG_BRANCH}.zip \
#    && unzip ${VG_BRANCH}.zip voko-grundo-${VG_BRANCH}/smb/*.mp
#RUN cd voko-grundo-${VG_BRANCH} && ../mp2png.sh # && cd ${HOME}

# staĝo 2: nodejs: kompilu CSS kaj JS

FROM ubuntu as builder

# por stabila versio de nodejs, uzu anstatataŭe: setup_14.x
RUN apt-get update && apt-get install -y curl \
 && curl -sL https://deb.nodesource.com/setup_15.x | bash - \
 && apt-get install -y nodejs 

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install && npm run build

# staĝo 3 kopiu nur la kreitajn rezultojn al nova malplena ujo
FROM scratch
COPY --from=builder /usr/app/build/ build/


