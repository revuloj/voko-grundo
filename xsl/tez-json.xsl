<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="1.0">


<!-- (c) 2006-2013 che Wolfram Diestel
     licenco GPL 2.0
-->

<xsl:output method="text" encoding="utf-8"/>

<xsl:template match="/">
  <xsl:text>[ </xsl:text>
  <xsl:apply-templates select="//ref"/>
  <xsl:text>[] ]
</xsl:text>
</xsl:template>

<xsl:template match="ref">
  <xsl:variable name="tip" select="ancestor-or-self::*[@tip][1]/@tip"/>
  <xsl:text>["</xsl:text>
    <xsl:apply-templates select="ancestor::*[@mrk][1]/@mrk"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="$tip"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="@cel"/>
    <xsl:if test="$tip='lst'">
      <xsl:text>","</xsl:text>
      <xsl:value-of select="@lst"/>
    </xsl:if>
  <xsl:text>"],
</xsl:text>
</xsl:template>

<xsl:template match="@mrk">
  <xsl:value-of select="."/>
</xsl:template>

<xsl:template match="art/@mrk">
  <xsl:value-of select="substring-after(substring-before(.,'.xml'),'Id: ')"/>
</xsl:template>



</xsl:stylesheet>
