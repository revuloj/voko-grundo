<!DOCTYPE xsl:transform>

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:saxon="http://saxon.sf.net/"
  version="2.0"
  extension-element-prefixes="saxon" 
>

<!-- xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="1.0"
    xmlns:redirect="http://xml.apache.org/xalan/redirect"
    extension-element-prefixes="redirect" -->


<!-- (c) 2006 - 2023 ĉe Wolfram Diestel
     laŭ permesilo GPL 2.0

    La transformilo kreas la retpaĝojn pri ŝangoj kaj novaj artikoloj de Revo.
    La XML-fonto-dokumento unue devos kreiĝi el la arĥivosistemo, kies eroj
    estas "entry"-elementoj. 
-->

<xsl:include href="inc/inx_menuo.inc"/>

<xsl:output method="xhtml" encoding="utf-8" indent="no"/>

<xsl:key name="autoroj" match="//entry" use="substring-before(msg,':')"/>


<xsl:template match="/">
  <xsl:call-template name="shanghoj"/>
  <xsl:call-template name="novaj"/>
</xsl:template>


<xsl:template name="shanghoj">
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> 
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>laste &#x015d;an&#x011d;itaj artikoloj</title>
      <link title="indekso-stilo" type="text/css" 
            rel="stylesheet" href="../stl/indeksoj.css"/>
    </head>
    <body>
      <table cellspacing="0">
        <xsl:call-template name="menuo-ktp"/>
        <tr>
          <td colspan="{$inx_paghoj}" class="enhavo">
            <h1>laste &#x015d;an&#x011d;itaj</h1>

            <!-- unu sekcio details/summary por ĉiu aŭtoro 
                 senaŭtoraj ŝangoj kolektiĝos sub "revo"

                erareto: Se la ero ne havas aŭtoron, sed enhavas dupunkton, la teksto
                antaŭ tiu estas miskomprenata kiel aŭtornomo!
            -->
            <xsl:for-each select="//entry[count(.
              |key('autoroj',substring-before(msg,':'))[1])=1 and contains(file[1]/name,'.xml')]">
              <xsl:sort select="substring-before(msg,':')"/>
              <xsl:variable name="autoro" select="substring-before(msg,':')"/>

              <details>                
                <summary>
                  <strong>
                    <xsl:call-template name="autoro">
                      <xsl:with-param name="spaco" select="' '"/>
                    </xsl:call-template>
                  </strong>
                </summary>

                <!-- la ŝanĝoj de tiu aŭtoro -->
                <xsl:for-each select="key('autoroj',$autoro)">
                  <xsl:sort select="date" order="descending"/>
                  <dl>
                    <xsl:apply-templates select="file"/>
                  </dl>
                </xsl:for-each>
                <hr/>
              </details>            
            </xsl:for-each>

          </td>
        </tr>
      </table>
    </body>
  </html>
</xsl:template>


<xsl:template name="novaj">
  <xsl:result-document href="novaj.html" method="xhtml" encoding="utf-8">
  <!-- redirect:write select="'novaj.html'" -->
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>novaj artikoloj</title>
      <link title="indekso-stilo" type="text/css" 
            rel="stylesheet" href="../stl/indeksoj.css"/>
    </head>
    <body>
      <table cellspacing="0">
        <xsl:call-template name="menuo-ktp"/>
        <tr>
          <td colspan="{$inx_paghoj}" 
              class="enhavo">
            <h1>novaj artikoloj</h1>
            <dl>
            <xsl:for-each
               select="//entry[substring-after(msg,':')=' nova artikolo']/file">
 
              <!-- xsl:sort lang="eo" select="name"/ -->
              <xsl:sort select="../date" order="descending"/>
              <xsl:sort lang="eo" select="name"/>
         
              <xsl:call-template name="nova_artikolo"/>

            </xsl:for-each>
            </dl>
          </td>
        </tr>
      </table>
    </body>
  </html>
  <!-- /redirect:write -->
  </xsl:result-document>
</xsl:template>


<xsl:template name="autoro">
  <xsl:param name="spaco"/>
  <xsl:choose>
    <xsl:when test="substring-before(ancestor-or-self::entry/msg,':')">
      <xsl:value-of select="translate(substring-before(ancestor-or-self::entry/msg,':'),' ',$spaco)"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:text>revo</xsl:text>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="entry">
  <xsl:apply-templates select="file"/>
</xsl:template>

<xsl:template match="entry/file">
  <dt>
    <a target="precipa">
     <xsl:attribute name="href">
       <xsl:text>../art/</xsl:text>
       <xsl:value-of select="substring-before(name,'.xml')"/>
       <xsl:text>.html</xsl:text>
     </xsl:attribute>
     <b><xsl:value-of select="substring-before(name,'.xml')"/></b>
    </a> 
    <xsl:text> </xsl:text>
    <span class="dato"><xsl:value-of select="../date"/></span>
  </dt>
  <dd>
    <xsl:choose>
      <xsl:when test="substring-after(../msg,':')">
        <xsl:value-of select="substring-after(../msg,':')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="../msg"/>
      </xsl:otherwise>
    </xsl:choose>
  </dd>
</xsl:template>


<xsl:template name="nova_artikolo">
  <dt>
    <a target="precipa">
     <xsl:attribute name="href">
       <xsl:text>../art/</xsl:text>
       <xsl:value-of select="substring-before(name,'.xml')"/>
       <xsl:text>.html</xsl:text>
     </xsl:attribute>
     <b><xsl:value-of select="substring-before(name,'.xml')"/></b>
    </a> 
    <xsl:text> </xsl:text>
    <span class="dato"><xsl:value-of select="../date"/></span>
  </dt>
  <dd>
    <xsl:text>de </xsl:text>
    <xsl:call-template name="autoro">
      <xsl:with-param name="spaco" select="' '"/>
    </xsl:call-template>
  </dd>
</xsl:template>


<!-- /xsl:stylesheet -->
</xsl:transform>



