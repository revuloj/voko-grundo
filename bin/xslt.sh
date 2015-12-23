#old xt: CLASSPATH=/usr/lib/xml/xp.jar:/usr/lib/xml/xt.jar:/usr/lib/xml/sax.jar

XTPATH=/home/revo/xt-20020426a-src
CLASSPATH=$XTPATH/xt.jar:$XTPATH/lib/xp.jar:$XTPATH/lib/xml-apis.jar
export CLASSPATH

export JAVA_HOME=/opt/JavaEE5/java
$JAVA_HOME/bin/java com.jclark.xsl.sax.Driver $1 $2

# problemo: xsltproc ne ordigas lau Eo, do
# chehha traduko venas nur fine
# /usr/bin/xsltproc $2 $1

