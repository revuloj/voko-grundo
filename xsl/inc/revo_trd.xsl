<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		version="1.0">

<!-- (c) 1999-2020 ĉe Wolfram Diestel laŭ GPLv2

reguloj por prezentado de la tradukoj

-->

<!-- lingvo-informojn memoru en variablo por pli facila aliro -->
<!-- kauzas problemon kun sort en xalan : 
<xsl:variable name="lingvoj" select="document($lingvoj_cfg)/lingvoj"/ -->


<!-- tradukoj -->

<!-- ne montru tradukojn en la teksto, sed malsupre en propra alineo 
<xsl:template match="trdgrp|trd"/>
-->

<xsl:template name="tradukoj">
  <xsl:if test=".//trd">
    <xsl:variable name="self" select="."/>
    <section class="tradukoj">
      <!-- elektu por chiu lingvo unu reprezentanton -->
      <xsl:for-each select="document($lingvoj_cfg)/lingvoj/lingvo">
        <xsl:sort lang="eo" use="."/>
        <xsl:variable name="lng" select="@kodo"/>
        <xsl:variable name="lingvo" select="concat(substring(.,1,string-length(.)-1),'e')"/>
                  
        <xsl:for-each select="$self">
          <xsl:call-template name="lingvo">
            <xsl:with-param name="lng">
              <xsl:value-of select="$lng"/>
            </xsl:with-param>
            <xsl:with-param name="lingvo">
              <xsl:value-of select="$lingvo"/>
            </xsl:with-param>
          </xsl:call-template>

        </xsl:for-each>
      </xsl:for-each>
    </section>
  </xsl:if>
</xsl:template>

<!-- traktas unuopan lingvon -->

<xsl:template name="lingvo">
  <xsl:param name="lng"/>
  <xsl:param name="lingvo"/>

  <xsl:if test=".//trd[@lng=$lng]|.//trdgrp[@lng=$lng]">

    <span lang="eo"><xsl:value-of select="$lingvo"/>: </span>

    <span>
      <xsl:apply-templates mode="tradukoj"
        select=".//trdgrp[@lng=$lng and not(parent::ekz|parent::bld)]|
                .//trd[@lng=$lng and not(parent::ekz|parent::bld)]"/>
      <xsl:apply-templates mode="tradukoj"
        select=".//trdgrp[@lng=$lng and (parent::ekz|parent::bld)]|
                .//trd[@lng=$lng and (parent::ekz|parent::bld)]"/>
    </span>
    <!-- <br/> provizore -->
  </xsl:if>
</xsl:template>  


<!-- traktas unuopan tradukon au tradukgrupon -->

<xsl:template match="trd[@lng]|trdgrp" mode="tradukoj">

  <!-- rigardu, al kiu subarbo apartenas la traduko kaj skribu la
	 tradukitan vorton/sencon -->

  <xsl:variable name="mrk">
    <xsl:value-of select="ancestor::node()[@mrk][1]/@mrk"/>
  </xsl:variable>
  <strong class="trdeo">
    <xsl:apply-templates 
      select="ancestor::node()[
        self::drv or 
        self::snc or 
        self::subsnc or
        self::subdrv or 
        self::subart or 
        self::art or 
        self::ekz or
        self::bld][1]" mode="kapvorto"/>:
  </strong>

  <!-- skribu la tradukon mem --> 
  <xsl:text> </xsl:text>

  <span lang="{@lng}">
    <xsl:if test="@lng = 'ar' or
                  @lng = 'fa' or
                  @lng = 'he'">
      <xsl:attribute name="dir">
        <xsl:text>rtl</xsl:text>
      </xsl:attribute>
    </xsl:if>

    <xsl:choose>
      <xsl:when test="trd">
        <xsl:apply-templates select="trd" mode="tradukoj"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates mode="tradukoj"/>
      </xsl:otherwise>
    </xsl:choose>
  </span>

  <xsl:choose>
    <xsl:when test="not(position()=last())">
      <xsl:text>; </xsl:text>
    </xsl:when>
    <xsl:otherwise>
      <xsl:text>. </xsl:text>
    </xsl:otherwise>
  </xsl:choose>

</xsl:template>


<xsl:template match="trdgrp/trd" mode="tradukoj">
  <xsl:apply-templates mode="tradukoj"/>

  <xsl:variable name="komo">
    <xsl:choose>
      <!-- Ne validas por la hebrea. -->
      <xsl:when test="../@lng = 'fa' or
                      ../@lng = 'ar'">
        <xsl:text>&#x060C;</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>,</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:if test="following-sibling::trd">
    <xsl:value-of select="$komo"/>
    <xsl:text> </xsl:text>
  </xsl:if>
</xsl:template>

<!--
<xsl:template match="trdgrp|trd[@lng]">
  <span lang="eo">
    <xsl:for-each select="document($lingvoj_cfg)/lingvoj/lingvo[@kodo=current()/@lng]">
      <xsl:value-of select="concat(substring(.,1,string-length(.)-1),'e')"/>
    </xsl:for-each>:
  </span>
  <span lang="{@lng}">
    <xsl:if test="@lng = 'ar' or
                  @lng = 'fa' or
                  @lng = 'he'">
      <xsl:attribute name="dir">
        <xsl:text>rtl</xsl:text>
      </xsl:attribute>
    </xsl:if>

    <xsl:choose>
      <!- - de kelkaj lingvoj kiel "ar", "fa" ni bezonas enmeti apartan specon de komo \u60c - ->
      <xsl:when test="trd">
        <xsl:apply-templates select="trd"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
    <br/>
  </span>
</xsl:template>
-->

<!-- nur tradukojn ene de difino kaj bildo 
montru tie, cxar ili estas esenca parto de tiuj --> 

<xsl:template match="dif/trd|bld/trd">
  <i><xsl:apply-templates/></i>
</xsl:template>


<xsl:template match="trdgrp/trd">
  <xsl:apply-templates/>

  <xsl:variable name="komo">
    <xsl:choose>
      <!-- Ne validas por la hebrea. -->
      <xsl:when test="../@lng = 'fa' or
                      ../@lng = 'ar'">
        <xsl:text>&#x060C;</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>,</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:if test="following-sibling::trd">
    <xsl:value-of select="$komo"/>
    <xsl:text> </xsl:text>
  </xsl:if>
</xsl:template>

<xsl:template match="klr[@tip='ind']"/>
   <!-- ne skribu indeksajn klarigojn tie cxi -->

<xsl:template match="baz"/>
<!--
  <xsl:text>/</xsl:text>
  <xsl:apply-templates/>
  <xsl:text>/</xsl:text>
</xsl:template>
-->

</xsl:stylesheet>
