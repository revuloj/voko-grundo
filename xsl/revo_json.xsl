<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="1.0">


<!-- (c) 2021 ĉe Wolfram Diestel
     laŭ permesilo GPL 2.0
-->


<!-- 
  Kolektante la kapvortojn, markojn, referencojn kaj tradukojn ene de artikolo:
  - metas art-mrk kiel ŝlosilon
  - forigas art-mrk kiel prefikso de mrk-oj
  - forigas prefikson "voko:" de listoj
  
  La rezulto estas JSON-dosiero per kiu ni plenigas kaj aktualigas la
  datumbazon por la serĉo, redakta kontrolo kaj tezaŭro.
-->

<xsl:output method="text" encoding="utf-8"/>
<xsl:strip-space elements="kap"/>

<!-- la kadra strukturo de la artikolo - ties dosiernomo kiel ŝlosilo -->

<xsl:template match="/">
  <xsl:text>{"</xsl:text>
  <!-- la nuda nomo de la artikolo -->
  <xsl:apply-templates select="//art/@mrk"/>
  <xsl:text>":{
"id":"</xsl:text>
  <!-- la tuta artikolmarko, kun dosiernomo, eldono kaj dato -->
  <xsl:value-of select="//art/@mrk"/>
<xsl:text>",
</xsl:text>  
  <xsl:call-template name="drv-kap"/>
  <xsl:call-template name="snc-mrk"/>
  <xsl:call-template name="ref"/>
  <xsl:call-template name="trd"/>
  <xsl:text>}}
</xsl:text>
</xsl:template>

<xsl:template match="art/@mrk">
  <xsl:value-of select="substring-after(substring-before(.,'.xml'),'Id: ')"/>
</xsl:template>

<!-- kolekti la kapvortojn de drv 
================================= -->

<xsl:template name="drv-kap">
  <xsl:text>"kap":[
</xsl:text>
  <xsl:apply-templates select=".//drv"/>
  <xsl:text>],
</xsl:text>
</xsl:template>

<xsl:template match="drv">
  <xsl:apply-templates select="./kap"/>

  <xsl:if test="following::drv">
  <xsl:text>,
</xsl:text>
  </xsl:if>
</xsl:template>

<xsl:template match="drv/kap">
  <xsl:variable name="kap"><xsl:apply-templates select="text()|tld"/></xsl:variable>
  <xsl:text>["</xsl:text>
  <xsl:value-of select="normalize-space(translate($kap,'/,',''))"/>
  <xsl:text>","</xsl:text>
  <xsl:apply-templates select="ancestor::drv/@mrk"/>
  <xsl:text>"]</xsl:text>
  <!-- se ekzistas var, sldonu ilin simile... -->
  <xsl:if test="var">
    <xsl:text>,
</xsl:text>
    <xsl:apply-templates select="var"/>
  </xsl:if>
</xsl:template>


<xsl:template match="kap/var">
  <xsl:variable name="kap"><xsl:apply-templates select="kap/text()|kap/tld"/></xsl:variable>
  <xsl:text>["</xsl:text>
  <xsl:value-of select="translate(normalize-space($kap),'/,','')"/>
  <xsl:text>","</xsl:text>
  <xsl:apply-templates select="ancestor::drv/@mrk"/>
  <xsl:text>","</xsl:text>
  <xsl:value-of select="kap/tld/@var"/>
  <xsl:text>"]</xsl:text>
  <xsl:if test="following-sibling::var">
    <xsl:text>,
</xsl:text>
  </xsl:if>
</xsl:template>


<!-- kolekti la elementojn kun @mrk, kiuj do povas 
aperi kiel ref@cel, t.e. referencitaj de iu ajn artikolo 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

<xsl:template name="snc-mrk">
  <xsl:text>"mrk":[
</xsl:text>
  <xsl:for-each select="//art//*[@mrk and not(self::drv)]">
    <xsl:text>["</xsl:text>
    <xsl:apply-templates select="@mrk"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="name()"/>
    <xsl:text>","</xsl:text>
    <xsl:call-template name="snc-num"/>
    <xsl:text>"]</xsl:text>
    <xsl:if test="descendant::*[@mrk and not(self::drv)]|following::*[@mrk and not(self::drv)]">
      <xsl:text>,
</xsl:text>     
    </xsl:if>   
  </xsl:for-each>
  <xsl:text>],
</xsl:text>
</xsl:template>

<xsl:template name="snc-num">
  <xsl:choose>
      <xsl:when test="ancestor::drv[count(snc)=1]"/> <!-- and not ancestor::subsnc (?) -->
      <xsl:otherwise>
        <xsl:number from="drv|subart" level="multiple" count="snc|subsnc" format="1.a"/>
      </xsl:otherwise>
  </xsl:choose>
</xsl:template>


<!-- kolekti ĉiujn referencojn...
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

<xsl:template name="ref">
  <xsl:text>"ref":[
</xsl:text>
  <xsl:apply-templates select=".//ref"/>
  <xsl:text>],
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
      <xsl:value-of select="substring-after(@lst,'voko:')"/>
    </xsl:if>
  <xsl:text>"]</xsl:text>
  <xsl:if test="following::ref">
    <xsl:text>,
</xsl:text>
  </xsl:if>
</xsl:template>


<xsl:template match="@mrk">
  <xsl:variable name="art" select="substring-after(substring-before(//art/@mrk,'.xml'),'Id: ')"/>
  <xsl:value-of select="substring-after(.,$art)"/>
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

<!-- se preterglitas elementoj per xsltproc! -->
<xsl:template match="*">
  <xsl:message terminate="no">
    AVERTO: Nekaptita elemento (apply sen select?): <xsl:value-of select="name()"/>
  </xsl:message>
</xsl:template>


<!-- kolekti la tradukojn
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

<xsl:template name="trd">
  <xsl:text>"trd":[
</xsl:text>
  <xsl:apply-templates select=".//trd"/>
  <xsl:text>]</xsl:text>
</xsl:template>


<xsl:template match="trd">
  <xsl:variable name="lng" select="ancestor-or-self::*[@lng][1]/@lng"/>
  <xsl:text>["</xsl:text>

    <xsl:apply-templates select="ancestor::*[@mrk][1]/@mrk"/>
    <xsl:text>","</xsl:text>
    <xsl:value-of select="$lng"/>
    <xsl:text>","</xsl:text>
    <!-- la indeksenda kapvorto: ni devas ekskluzive distingi inter ind, mll kaj text...-->
    <xsl:choose>
      <xsl:when test="ind">
        <xsl:value-of select="normalize-space(translate(ind,'&quot;','&#x7f;'))"/>
      </xsl:when>
      <xsl:when test="mll">
        <xsl:value-of select="normalize-space(translate(mll,'&quot;','&#x7f;'))"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="normalize-space(translate(text(),'&quot;','&#x7f;'))"/>
      </xsl:otherwise>
    </xsl:choose>
    <!-- ni aldonas trd nur se ĝi enhavas klr aŭ mll kaj do distingiĝas de la kapvorto -->
    <xsl:if test="klr|mll">
      <xsl:text>","</xsl:text>
      <!-- la traduko inkl. klr..., sed sen ofc -->
      <xsl:choose>
        <xsl:when test="mll">
          <xsl:apply-templates select="mll"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="trd-join"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>

  <xsl:text>"]</xsl:text>
  <xsl:if test="following::trd">
    <xsl:text>,
</xsl:text>
  </xsl:if>
</xsl:template>

<xsl:template name="trd-join">
  <!-- kuni ĉion al signoĉeno kaj pote normigi spacojn en XSL 1.0 estas iom malsimpla... -->
  <xsl:variable name="str">
    <xsl:for-each select="text()|ind|klr">
      <xsl:value-of select="."/>
    </xsl:for-each>
  </xsl:variable>
  <xsl:value-of select="normalize-space(translate($str,'&quot;','&#x7f;'))"/>
</xsl:template>

<xsl:template match="mll">
  <xsl:if test="@tip='fin' or @tip='mez'">
    <xsl:text>…</xsl:text>
  </xsl:if>
  <xsl:value-of select="normalize-space(translate(.,'&quot;','&#x7f;'))"/>
  <xsl:if test="@tip='kom' or @tip='mez'">
    <xsl:text>…</xsl:text>
  </xsl:if>
</xsl:template>

</xsl:stylesheet>
