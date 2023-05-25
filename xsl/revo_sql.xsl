<xsl:transform xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="2.0">


<!-- (c) 2016 che Wolfram Diestel
     licenco GPL 2.0

      necesas XPath 2.0 / Saxon pro funkcio "replace" (anstataŭigo de apostrofo per du apostrofoj)
-->


<xsl:output method="text" encoding="utf-8"/>
<xsl:strip-space elements="kap"/>

<!--
<xsl:key name="retro" match="ref" use="@cel"/>
-->

<!-- <xsl:variable name="sqlite-status" select="'jes'"/> -->
<xsl:variable name="sqlite-status" select="'ne'"/>


<xsl:template match="/">
<xsl:text>BEGIN;
</xsl:text>
  <xsl:apply-templates/>
<xsl:text>
COMMIT;
</xsl:text>
</xsl:template>

<xsl:template match="art">
  <xsl:if test="$sqlite-status='jes'">
    <xsl:variable name="pos" select="position()"/>
    <xsl:if test="$pos mod 100 = 0">
<xsl:text>

.print </xsl:text>
<xsl:value-of select="$pos"/> (<xsl:value-of select="@mrk"/>)
<xsl:text>
</xsl:text>
    </xsl:if>
  </xsl:if>

  <xsl:apply-templates select="subart|drv|snc"/>
</xsl:template>

<xsl:template match="subart|drv|subdrv">
  <xsl:apply-templates select="drv|subdrv|snc|subsnc"/>
</xsl:template>

<!-- derivaĵo kun nur unu senco, ni kreas nur unu nodon por la derivaĵo -->
<xsl:template match="drv[count(snc)=1]">
<xsl:variable name="mrk" select="@mrk"/>
<xsl:text>

INSERT INTO nodo(mrk,art,kap,num) VALUES('</xsl:text>
<xsl:value-of select="$mrk"/>
<xsl:text>','</xsl:text>
<xsl:call-template name="art-mrk"><xsl:with-param name="mrk" select="$mrk"/></xsl:call-template>
<xsl:text>','</xsl:text>
<xsl:apply-templates select="ancestor-or-self::node()[self::art or self::drv][kap][1]/kap"/>
<xsl:text>',NULL);</xsl:text>


  <!-- variaĵoj -->
  <xsl:for-each select="kap/var">
      <xsl:call-template name="var">
        <xsl:with-param name="mrk" select="$mrk"/>
      </xsl:call-template>
  </xsl:for-each>


<!-- nun traktu uzo, trd, ref, snc/subsnc ... -->

  <xsl:for-each select="uzo|stl">
    <xsl:call-template name="uzo">
      <xsl:with-param name="mrk" select="$mrk"/>
    </xsl:call-template>
  </xsl:for-each>

  <xsl:for-each select="(trd|snc/trd)">
    <xsl:call-template name="traduko">
      <xsl:with-param name="mrk" select="$mrk"/>
    </xsl:call-template>
  </xsl:for-each>

  <xsl:for-each select=".//ref">
    <xsl:call-template name="referenco">
      <xsl:with-param name="mrk" select="$mrk"/>
    </xsl:call-template>
  </xsl:for-each>

  <xsl:for-each select="gra/vspec">
    <xsl:call-template name="vortspeco">
      <xsl:with-param name="mrk" select="$mrk"/>
    </xsl:call-template>
  </xsl:for-each>

  <xsl:apply-templates select="snc/subsnc"/>

</xsl:template>

<!-- derivaĵo kun pluraj sencoj aŭ snc/subsnc -->
<xsl:template match="drv[count(snc)!=1]|snc|subsnc">
<xsl:variable name="mrk">
  <xsl:call-template name="tez-mrk-n"/>
</xsl:variable>
<xsl:text>                                                                                                             

INSERT INTO nodo(mrk,art,kap,num) VALUES('</xsl:text>
<xsl:value-of select="$mrk"/>
<xsl:text>','</xsl:text>
<xsl:call-template name="art-mrk"><xsl:with-param name="mrk" select="$mrk"/></xsl:call-template>
<xsl:text>','</xsl:text>
<xsl:apply-templates select="ancestor-or-self::node()[self::art or self::drv][kap][1]/kap"/>
<xsl:text>','</xsl:text>
<xsl:if test="count(../snc)+count(../subsnc) &gt; 1">
  <xsl:call-template name="tez-snc-n"/>
</xsl:if>
<xsl:text>');</xsl:text>


  <!-- variaĵoj -->
  <xsl:for-each select="kap/var">
      <xsl:call-template name="var">
        <xsl:with-param name="mrk" select="$mrk"/>
      </xsl:call-template>
  </xsl:for-each>


<!-- nun traktu uzo, trd, ref, snc/subsnc ... -->
  <xsl:for-each select="uzo|stl">
    <xsl:call-template name="uzo">
      <xsl:with-param name="mrk" select="$mrk"/>
    </xsl:call-template>
  </xsl:for-each>

  <xsl:for-each select="(trd|snc/trd)">
    <xsl:call-template name="traduko">
      <xsl:with-param name="mrk" select="$mrk"/>
    </xsl:call-template>
  </xsl:for-each>

  <xsl:for-each select="ref">
    <xsl:call-template name="referenco">
      <xsl:with-param name="mrk" select="$mrk"/>
    </xsl:call-template>
  </xsl:for-each>
  
  <xsl:for-each select="gra/vspec">
    <xsl:call-template name="vortspeco">
      <xsl:with-param name="mrk" select="$mrk"/>
    </xsl:call-template>
  </xsl:for-each>

  <xsl:apply-templates select="snc|subsnc|subdrv"/>

</xsl:template>



<!-- snc-numero -->
<xsl:template match="snc" mode="number-of-ref-snc">
  <xsl:number from="drv|subart" level="any" count="snc"/>
</xsl:template>

<!-- subsnc-numero -->
<xsl:template match="subsnc" mode="number-of-ref-snc">
  <xsl:number from="drv|subart" level="multiple" count="snc|subsnc"
    format="1.a"/>
</xsl:template>

<!-- tezaŭro-marko -->
<xsl:template name="tez-mrk-n">
   <xsl:choose>
      <xsl:when test="@mrk">
         <xsl:value-of select="@mrk"/>
      </xsl:when>

      <xsl:otherwise>
         <xsl:value-of select="ancestor::node()[@mrk][1]/@mrk"/><xsl:text>.</xsl:text>
	 <xsl:apply-templates mode="number-of-ref-snc" select="."/> 
         <!-- <xsl:number from="drv|subart" level="multiple" count="snc|subsnc" format="1.a"/> -->
      </xsl:otherwise>
   </xsl:choose>
</xsl:template>

<xsl:template name="tez-snc-n">
  <xsl:apply-templates mode="number-of-ref-snc" select="."/>
  <!-- <xsl:number from="drv|subart" level="multiple" count="snc|subsnc" format="1.a"/> -->
</xsl:template>

<!-- artikol-marko -->
<xsl:template name="art-mrk">
  <xsl:param name="mrk"/>
  <xsl:choose>
    <xsl:when test="contains($mrk,'.')">
      <xsl:value-of select="substring-before($mrk,'.')"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$mrk"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- xsl:template match="snc|subsnc"/ --> <!-- ignoru sen @mrk -->

<!-- kapvorto -->
<xsl:template match="kap">
   <xsl:variable name="kap"><xsl:apply-templates select="text()|rad|tld"/></xsl:variable>
   <xsl:value-of select="normalize-space(replace(translate($kap,'/,',''),'''',''''''))"/> 
<!--  <xsl:value-of select="normalize-space(translate($kap,'/,',''))"/> -->
</xsl:template>

<!-- tildo -->

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


<!-- variaĵo -->
<xsl:template name="var">
  <xsl:param name="mrk"/>
<xsl:text>

INSERT INTO var(mrk,kap,num) VALUES('</xsl:text>
<xsl:value-of select="$mrk"/>
<xsl:text>','</xsl:text>
<xsl:apply-templates select="kap"/>
<xsl:text>','</xsl:text>
<xsl:apply-templates select="kap/tld/@var"/>
<xsl:text>');</xsl:text>
</xsl:template>


<!-- uzo -->
<xsl:template name="uzo">
  <xsl:param name="mrk"/>
<xsl:text>                                                                                                                   
INSERT INTO uzo(mrk,tip,uzo) VALUES('</xsl:text>
<xsl:value-of select="$mrk"/>
<xsl:text>','</xsl:text>
<xsl:value-of select="local-name()"/>
<xsl:text>','</xsl:text>
<xsl:value-of select="normalize-space()"/>
<xsl:text>');</xsl:text>
</xsl:template>



<!-- traduko -->
<xsl:template name="traduko">
  <xsl:param name="mrk"/>
<xsl:text>                                                                                                             
INSERT INTO traduko(mrk,lng,trd,txt) VALUES('</xsl:text>
<xsl:value-of select="$mrk"/>
<xsl:text>','</xsl:text>
<xsl:value-of select="@lng"/>
<xsl:text>','</xsl:text>
<xsl:call-template name="trd-inx"/>
<xsl:text>','</xsl:text>
<xsl:value-of select="replace(normalize-space(),'''','''''')"/>
<!-- <xsl:value-of select="normalize-space()"/>  -->
<xsl:text>');</xsl:text>
</xsl:template>


<xsl:template name="trd-inx">
  <xsl:choose>
    <xsl:when test=".//ind">
      <xsl:for-each select=".//ind">
        <xsl:value-of select="replace(normalize-space(.),'''','''''')"/>
      </xsl:for-each>
    </xsl:when>
    <xsl:otherwise>
      <xsl:for-each select="text()">
	<xsl:value-of select="replace(normalize-space(.),'''','''''')"/>
      </xsl:for-each>
<!--      <xsl:value-of select="replace(text()/normalize-space(.),'''','''''')"/> -->
<!--      <xsl:value-of select="replace(normalize-space(text()),'''','''''')"/> -->
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- referenco -->
<xsl:template name="referenco">
  <xsl:param name="mrk"/>
<xsl:text>                                                                                                                   
INSERT INTO referenco(mrk,cel,tip) VALUES('</xsl:text>
<xsl:value-of select="$mrk"/>
<xsl:text>','</xsl:text>
<xsl:value-of select="@cel"/>
<xsl:text>','</xsl:text>
<xsl:value-of select="@tip"/>
<xsl:text>');</xsl:text>
</xsl:template>

<xsl:template name="vortspeco">
  <xsl:param name="mrk"/>
<xsl:text>                                                                                                             
INSERT INTO vortspeco(mrk, vsp) VALUES('</xsl:text>
<xsl:value-of select="$mrk"/>
<xsl:text>','</xsl:text>
<xsl:value-of select="."/>
<xsl:text>');</xsl:text>
</xsl:template>

<!--

<xsl:template name="ekz">
  <ekz>
    <xsl:for-each select="ref[@tip='ekz']">
       <r c="{@cel}"/>
    </xsl:for-each>
    <xsl:for-each select="key('retro',@mrk)[@tip='lst']">
       <r c="{ancestor-or-self::node()[@mrk][1]/@mrk}"/>
    </xsl:for-each>
  </ekz>
</xsl:template>


<xsl:template name="ekz2">
  <ekz>
    <xsl:for-each select=".//ref[@tip='ekz']">
       <r c="{@cel}"/>
    </xsl:for-each>
    <xsl:for-each select="key('retro',@mrk)[@tip='lst']|key('retro',snc/@mrk)[@tip='lst']">
       <r c="{ancestor-or-self::node()[@mrk][1]/@mrk}"/>
    </xsl:for-each>
  </ekz>
</xsl:template>


<xsl:template name="lst">
  <lst>
    <xsl:for-each select="ref[@tip='lst']">
       <r c="{@cel}"/>
    </xsl:for-each>
    <xsl:for-each select="key('retro',@mrk)[@tip='ekz']">
       <r c="{ancestor-or-self::node()[@mrk][1]/@mrk}"/>
    </xsl:for-each>
  </lst>
</xsl:template>


<xsl:template name="lst2">
  <lst>
    <xsl:for-each select=".//ref[@tip='lst']">
       <r c="{@cel}"/>
    </xsl:for-each>
    <xsl:for-each select="key('retro',@mrk)[@tip='ekz']|key('retro',snc/@mrk)[@tip='ekz']">
       <r c="{ancestor-or-self::node()[@mrk][1]/@mrk}"/>
    </xsl:for-each>
  </lst>
</xsl:template>

-->

</xsl:transform>










