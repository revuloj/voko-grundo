<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xt="http://www.jclark.com/xt"
		version="1.0"
                extension-element-prefixes="xt">

<xsl:output method="text" encoding="utf-8"/>

<!--

(c) 2023 ĉe Wolfram Diestel
lau permesilo GPL 2.0

uzata kiel bibliografia listo por Revo

-->

<xsl:strip-space elements="eld"/>

<xsl:template match="/">
    <xsl:apply-templates/>
</xsl:template>

<!-- art, subart -->

<xsl:template match="bibliografio">
  <xsl:text>[
</xsl:text>
    <xsl:apply-templates select="vrk">
      <xsl:sort select="@mll"/>
    </xsl:apply-templates>
  <xsl:text>
{}]
</xsl:text>
</xsl:template>

<xsl:template match="vrk">
  <xsl:text>{</xsl:text>
  <xsl:apply-templates select="aut|trd|tit|ald|url|eld"/>
  <!-- laste, ĉar tiu ekzistu ĉiam kaj ni ne aldonas tiam finan komon -->
  <xsl:text>"bib":"</xsl:text><xsl:value-of select="@mll"/><xsl:text>"</xsl:text>
  <xsl:text>},
</xsl:text>
</xsl:template>

<xsl:template match="aut">
  <xsl:text>"aut":"</xsl:text>
  <xsl:apply-templates/>
  <xsl:text>",</xsl:text>
</xsl:template>

<xsl:template match="trd">
  <xsl:text>"trd":"</xsl:text>
  <xsl:apply-templates/>
  <xsl:text>",</xsl:text>
</xsl:template>

<xsl:template match="tit">
  <xsl:text>"tit":"</xsl:text>
  <xsl:value-of select="normalize-space(translate(.,'&quot;','&#x02ee;'))"/>
  <xsl:text>",</xsl:text>
</xsl:template>

<xsl:template match="url">
  <xsl:text>"url":"</xsl:text>
  <xsl:value-of select="normalize-space(.)"/>
  <xsl:text>",</xsl:text>
</xsl:template>

<xsl:template match="isbn">
  <xsl:text>ISBN: </xsl:text>
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="ald">
  <xsl:text>"ald":"</xsl:text>
  <xsl:value-of select="normalize-space(.)"/>
  <xsl:text>",</xsl:text>
</xsl:template>

<xsl:template match="eld">
  <xsl:text>"eld":"</xsl:text>
  <xsl:apply-templates select="nom|lok|dat"/>
  <xsl:text>",</xsl:text>
</xsl:template>

<xsl:template match="nom">
  <xsl:value-of select="normalize-space(translate(.,'&quot;','&#x02ee;'))"/>
  <xsl:if test="following-sibling::*">
      <xsl:text>, </xsl:text>
  </xsl:if>
</xsl:template>  

<xsl:template match="lok">
  <xsl:value-of select="normalize-space(.)"/>
  <xsl:if test="following-sibling::*">
    <xsl:text>, </xsl:text>
  </xsl:if>
</xsl:template>

<xsl:template match="dat">
  <xsl:value-of select="normalize-space(.)"/>
</xsl:template>

<xsl:template match="aut|trd" mode="inx">
  <xsl:choose>
    <xsl:when test="n">
      <xsl:value-of select="n"/>
      <xsl:if test="a">
        <xsl:text>, </xsl:text>
        <xsl:value-of select="a"/>
      </xsl:if>
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

</xsl:stylesheet>











