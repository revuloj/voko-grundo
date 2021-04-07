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
<xsl:strip-space elements="kap"/>


<xsl:template match="/">
  <xsl:text>{"</xsl:text>
  <xsl:apply-templates select="//art/@mrk"/>
  <xsl:text>":[
</xsl:text>
  <xsl:apply-templates select="//ref"/>
  <xsl:text>]}
</xsl:text>
</xsl:template>


<xsl:template match="ref">
  <xsl:variable name="tip" select="ancestor-or-self::*[@tip][1]/@tip"/>
  <xsl:text>["</xsl:text>
    <xsl:apply-templates select="ancestor::drv[1]/kap"/>
    <xsl:text>","</xsl:text>
    <xsl:call-template name="snc-num"/>
    <xsl:text>","</xsl:text>
    <xsl:apply-templates select="ancestor::*[@mrk][1]/@mrk"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="substring($tip,1,3)"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="@cel"/>
    <xsl:if test="$tip='lst'">
      <xsl:text>","</xsl:text>
      <xsl:value-of select="substring-after(@lst,'voko:')"/>
    </xsl:if>
  <xsl:text>"]</xsl:text>
  <xsl:if test="following::ref">
    <xsl:text>,
</xsl:text>
  </xsl:if>
</xsl:template>

<xsl:template match="drv/kap">
  <xsl:variable name="kap"><xsl:apply-templates select="text()|tld"/></xsl:variable>
  <xsl:value-of select="translate(normalize-space($kap),'/,','')"/>
</xsl:template>

<xsl:template name="snc-num">
  <xsl:choose>
      <xsl:when test="ancestor::drv[count(snc)=1]"/> <!-- and not ancestor::subsnc (?) -->
      <xsl:otherwise>
        <xsl:number from="drv|subart" level="multiple" count="snc|subsnc" format="1.a"/>
      </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="@mrk">
  <xsl:variable name="art" select="substring-after(substring-before(//art/@mrk,'.xml'),'Id: ')"/>
  <xsl:value-of select="substring-after(.,$art)"/>
</xsl:template>

<xsl:template match="art/@mrk">
  <xsl:value-of select="substring-after(substring-before(.,'.xml'),'Id: ')"/>
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

</xsl:stylesheet>
