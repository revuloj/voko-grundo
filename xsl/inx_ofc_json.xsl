<!DOCTYPE xsl:transform>

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:saxon="http://saxon.sf.net/"
  version="2.0"
  extension-element-prefixes="saxon" 
>


<!-- (c) 2023 ĉe Wolfram Diestel
     permesilo: GPL 2.0


  Transformilo por ekstrakti oficialajn radikojn kaj derivaĵojn (FdE, OA1..OA9)
  el la artikoloj de Revo. La rezulto estas JSON-dosiero.
-->


<xsl:output method="text" encoding="utf-8"/>
<xsl:strip-space elements="kap rad var"/>

<xsl:template match="/">
  <xsl:text>{</xsl:text>
    <!-- oficialaj kapvortoj -->
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'*'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'1'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'2'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'3'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'4'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'5'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'6'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'7'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'8'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'9'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'1923'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'1929'"/>
      </xsl:call-template>
      <xsl:call-template name="oficialaj">
        <xsl:with-param name="ofc" select="'1953'"/>
      </xsl:call-template>
  <xsl:text>"__":""}
</xsl:text>
</xsl:template>

<xsl:template name="oficialaj">
  <xsl:param name="ofc"/>
  <xsl:text>"</xsl:text>
  <xsl:value-of select="$ofc"/>
  <xsl:text>": [</xsl:text>

  <!-- radikoj -->
  <xsl:for-each select="//art/kap[ofc=$ofc]/rad|//art/kap/var/kap[ofc=$ofc]/rad">
    <xsl:sort lang="eo" select="."/>
    <xsl:variable name="kap">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:text>["</xsl:text>
    <xsl:value-of select="ancestor::art/@mrk"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="normalize-space($kap)"/>
    <xsl:text>"],
  </xsl:text>
  </xsl:for-each>
  <!-- derivaĵoj -->
  <xsl:for-each select="//art//drv/kap[ofc=$ofc]|//art//drv//var/kap[ofc=$ofc]">
    <!-- xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.EsperantoCollator" lang="eo" select="text()|tld"/ -->
    <xsl:variable name="kap">
      <xsl:apply-templates select="text()|tld"/>
    </xsl:variable>
    <xsl:text>["</xsl:text>
    <xsl:value-of select="ancestor::drv/@mrk"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="normalize-space($kap)"/>
    <xsl:text>"],
  </xsl:text>
  </xsl:for-each>

  <xsl:text>[]],
</xsl:text>
</xsl:template>


<xsl:template match="tld">
  <xsl:variable name="rad">
    <xsl:choose>
      <xsl:when test="@var">
        <xsl:value-of select="ancestor::art/kap/var/kap/rad[@var=current()/@var]"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="ancestor::art/kap/rad"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:choose>
    <xsl:when test="@lit">
      <xsl:value-of select="concat(@lit,substring($rad,2))"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$rad"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


<xsl:template match="text()">
  <xsl:value-of select="normalize-space(translate(.,',',''))"/>
</xsl:template>

<xsl:template match="fnt|ofc"/>



</xsl:transform>













