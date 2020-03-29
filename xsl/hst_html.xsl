<!DOCTYPE xsl:transform>

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:saxon="http://saxon.sf.net/"
  version="2.0"
  extension-element-prefixes="saxon" 
>

<!-- (c) 2020 ĉe Wolfram Diestel
     permesilo GPL 2.0
-->

<!-- variabloj por referencoj -->
<xsl:variable name="repo" select="'https://github.com/revuloj/revo-fonto/commit/'"/>
<xsl:variable name="revo" select="'http://reta-vortaro.de/revo'"/>

<xsl:output method="html" encoding="utf-8" use-character-maps="fix-characters"/>

<!-- workaround illegal char coding in log entries -->
<xsl:character-map name="fix-characters">
   <xsl:output-character character="&#127;" string=" "/>
   <xsl:output-character character="&#128;" string=" "/>
   <xsl:output-character character="&#129;" string=" "/>
   <xsl:output-character character="&#130;" string=" "/>
   <xsl:output-character character="&#131;" string=" "/>
   <xsl:output-character character="&#132;" string=" "/>
   <xsl:output-character character="&#133;" string=" "/>
   <xsl:output-character character="&#134;" string=" "/>
   <xsl:output-character character="&#135;" string=" "/>
   <xsl:output-character character="&#136;" string=" "/>
   <xsl:output-character character="&#137;" string=" "/>
   <xsl:output-character character="&#138;" string=" "/>
   <xsl:output-character character="&#139;" string=" "/>
   <xsl:output-character character="&#140;" string=" "/>
   <xsl:output-character character="&#141;" string=" "/>
   <xsl:output-character character="&#142;" string=" "/>
   <xsl:output-character character="&#143;" string=" "/>
   <xsl:output-character character="&#144;" string=" "/>
   <xsl:output-character character="&#145;" string=" "/>
   <xsl:output-character character="&#146;" string=" "/>
   <xsl:output-character character="&#147;" string=" "/>
   <xsl:output-character character="&#148;" string=" "/>
   <xsl:output-character character="&#149;" string=" "/>
   <xsl:output-character character="&#150;" string=" "/>
   <xsl:output-character character="&#151;" string=" "/>
   <xsl:output-character character="&#152;" string=" "/>
   <xsl:output-character character="&#153;" string=" "/>
   <xsl:output-character character="&#154;" string=" "/>
   <xsl:output-character character="&#155;" string=" "/>
   <xsl:output-character character="&#156;" string=" "/>
   <xsl:output-character character="&#157;" string=" "/>
   <xsl:output-character character="&#158;" string=" "/>
   <xsl:output-character character="&#159;" string=" "/>
</xsl:character-map>

<xsl:key name="dosieroj" match="//file" use="name"/>

<xsl:template match="/">
    <xsl:for-each select="(//file)[count(.|key('dosieroj',name)[1])=1]">
      <!-- xsl:message><xsl:value-of select="name"/></xsl:message -->
      <xsl:if test="substring-after(name,'.')='xml'">

<!--xsl:if test="name='sekret.xml'" -->
        <xsl:call-template name="historio">
          <xsl:with-param name="name">
            <xsl:value-of select="name"/>
          </xsl:with-param>
          <xsl:with-param name="dos">
            <xsl:value-of select="substring-before(name,'.')"/>
          </xsl:with-param>
        </xsl:call-template>
<!--/xsl:if -->
      </xsl:if>
    </xsl:for-each>
</xsl:template>

<xsl:template name="historio">
  <xsl:param name="name"/>
  <xsl:param name="dos"/>
<!--
  <xsl:message><xsl:value-of select="$dos"/></xsl:message>
-->  
  <xsl:result-document href="{$dos}.html" method="html" encoding="utf-8" indent="no">
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
      <title>Historio de <xsl:value-of select="$dos"/>.xml</title>
      <link rel="stylesheet" type="text/css" href="../stl/artikolo.css"/>
    </head>
    <body>
      <h1>Historio de  <a href="{$revo}/art/{$dos}.html"><xsl:value-of select="$dos"/></a>.xml</h1>
      <table class="art-hist">
   
      <xsl:for-each select="//entry[file/name=$name]">
        <!-- xsl:message><xsl:value-of select="@revision"/></xsl:message -->
        <tr>
          <td><xsl:value-of select="date"/></td>
          <td><a  target="_new" href="{$repo}{@revision}"><xsl:value-of select="@revision"/></a></td>
          <td><xsl:value-of select="msg"/></td>
        </tr>
      </xsl:for-each>

      </table>
    </body>
  </html>
  <!-- /redirect:write -->
  </xsl:result-document>
</xsl:template>

</xsl:transform>
