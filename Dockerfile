# Vi povas krei JS+CSS per
#   docker build -t voko-grundo .
# poste vi povas elpreni ĝin per
# 1)
#   docker run -it voko-grundo bash
#   docker ps
#   docker cp <cnt-id>:build/css/.. ./tmp/
#
# aŭ uzi la tutan ujon ene de alia per:
# 2)
# FROM voko-grundo as source
# FROM xyz
# COPY --from=source build/ ./


#######################################################
# staĝo 1: Ni bezonas TeX kaj metapost por konverti simbolojn al png
#######################################################
FROM silkeh/latex:small as metapost
LABEL maintainer=<diestel@steloj.de>

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

FROM ubuntu:jammy as builder
ARG NODE_MAJOR=20

# vd: https://github.com/nodesource/distributions
# rxp, jre kaj saxonb ni bezonas nur por testoj (xml-test.sh)
RUN apt-get update && apt-get install -y \
 ca-certificates gnupg curl xsltproc rxp default-jre libsaxonb-java \
 && mkdir -p /etc/apt/keyrings \
 && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | \
    gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
 && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] \
   https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | \
   tee /etc/apt/sources.list.d/nodesource.list \
 && apt update && apt-get install -y nodejs

WORKDIR /usr/app
COPY ./ /usr/app
COPY --from=metapost /build/ /usr/app/build/

# aldonu eble:  npm audit fix, kelkfoje ni devas uzi -g npm@next - se ekzistas posta eldono
# mi ne scias npm sufiĉe bone por formuli aktualigan komandon, kiu fidinde ĉiam funkcias...
# oni eble povus kombini ambaŭ per aŭ: { npm install -g npm@latest || npm install -g npm@next }
RUN npm install -g npm@latest && npm ci && npm run build && tst/xml-test.sh


# staĝo 3 kopiu nur la kreitajn rezultojn al nova malplena ujo
FROM scratch
COPY --from=builder /usr/app/build/ build/

# simplan kopiadon de pluraj fontoj ni faras per npm run build:copy
# COPY xsl/ build/xsl/


