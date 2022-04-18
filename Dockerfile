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
FROM silkeh/latex:small as metapost
LABEL Author=<diestel@steloj.de>

#ARG VG_BRANCH=master

# ni bezonas almenaŭ bin/mp2png_svg.sh kaj smb/

WORKDIR /
COPY bin/mp2png_svg.sh /bin/
COPY smb/ /smb/

#RUN apk --update add curl unzip librsvg --no-cache && rm -f /var/cache/apk/* 
#RUN curl -LO https://github.com/revuloj/voko-grundo/archive/${VG_BRANCH}.zip \
#    && unzip ${VG_BRANCH}.zip voko-grundo-${VG_BRANCH}/smb/*.mp
RUN bin/mp2png_svg.sh

# staĝo 2: nodejs: kompilu CSS kaj JS

FROM ubuntu as builder

# vd: https://github.com/nodesource/distributions
# rxp, jre kaj saxonb ni bezonas nur por testoj (xml-test.sh)
RUN apt-get update && apt-get install -y curl xsltproc rxp default-jre libsaxonb-java \
 && curl -sL https://deb.nodesource.com/setup_17.x | bash -E - \
 && apt-get install -y nodejs

WORKDIR /usr/app
COPY ./ /usr/app
COPY --from=metapost /build/ /usr/app/build/

# aldonu eble:  npm audit fix, kelkfoje ni devas uzi -g npm@next - se ekzistas posta eldono
# mi ne scias npm sufiĉe bone por forumli aktualigan komandon, kiu fidinde ĉiam funkcias...

RUN npm install -g npm@latest && npm ci && npm run build && tst/xml-test.sh


# staĝo 3 kopiu nur la kreitajn rezultojn al nova malplena ujo
FROM scratch
COPY --from=builder /usr/app/build/ build/
COPY xsl/ build/xsl/


