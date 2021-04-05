<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="1.0">


<!-- (c) 2021 ĉe Wolfram Diestel
     laŭ permesilo GPL 2.0
-->


<!-- 
  Kolektante la referencojn ene de artikolo:
  - metas art-mrk kiel ŝlosilon
  - forigas art-mrk kiel prefikso de mrk-oj
  - forigas prefikson "voko:" de listoj
  - uzas nur la unuajn 3 literojn de tipo, ĉar tiel aspektas aktuale la tabelo...
-->

<xsl:output method="text" encoding="utf-8"/>

<xsl:template match="/">
  <xsl:text>{ </xsl:text>
  <xsl:apply-templates select="//art/@mrk"/>
  <xsl:text>:[
</xsl:text>
  <xsl:apply-templates select="//ref"/>
  <xsl:text>null]}
</xsl:text>
</xsl:template>


<xsl:template match="ref">
  <xsl:variable name="tip" select="ancestor-or-self::*[@tip][1]/@tip"/>
  <xsl:text>["</xsl:text>
    <xsl:apply-templates select="ancestor::*[@mrk][1]/@mrk"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="substring($tip,1,3)"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="@cel"/>
    <xsl:if test="$tip='lst'">
      <xsl:text>","</xsl:text>
      <xsl:value-of select="substring-after(@lst,'voko:')"/>
    </xsl:if>
  <xsl:text>"],
</xsl:text>
</xsl:template>

<xsl:template match="@mrk">
  <xsl:variable name="art" select="substring-after(substring-before(//art/@mrk,'.xml'),'Id: ')"/>
  <xsl:value-of select="substring-after(.,concat($art,'.'))"/>
</xsl:template>

<xsl:template match="art/@mrk">
  <xsl:value-of select="substring-after(substring-before(.,'.xml'),'Id: ')"/>
</xsl:template>



</xsl:stylesheet>
