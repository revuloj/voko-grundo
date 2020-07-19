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

<xsl:template match="trdgrp|trd[@lng]">
  <section lang="{@lng}" class="trd">
    <span lang="eo">
      <xsl:for-each select="document($lingvoj_cfg)/lingvoj/lingvo[@kodo=current()/@lng]">
        <h3>
          <!-- aldonu e anst. a -->
          <xsl:value-of select="concat(substring(.,1,string-length(.)-1),'e')"/>
        </h3>
      </xsl:for-each>
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
        <!-- de kelkaj lingvoj kiel "ar", "fa" ni bezonas enmeti apartan specon de komo \u60c -->
        <xsl:when test="trd">
          <xsl:apply-templates select="trd"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates/>
        </xsl:otherwise>
      </xsl:choose>
    </span>
  </section>
</xsl:template>


<!-- nur tradukojn ene de difino kaj bildo 
montru tie, cxar ili estas esenca parto de tiuj --> 

<xsl:template match="dif/trd|bld/trd">
  <i><xsl:apply-templates/></i>
</xsl:template>


<!-- traktas unuopan tradukon au tradukgrupon 

<xsl:template match="trd[@lng]|trdgrp" mode="tradukoj">
  <span class="trdeo">

    <xsl:variable name="mrk">
      <xsl:value-of select="ancestor::node()[@mrk][1]/@mrk"/>
    </xsl:variable>

    <xsl:variable name="cel">
      <xsl:choose>
	<xsl:when test="starts-with($mrk,'$Id:')">
	  <xsl:value-of select="''"/> 
	</xsl:when>
	<xsl:otherwise>
	  <xsl:value-of select="$mrk"/>
	</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    
    <a class="trdeo" href="#{$cel}">
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
    </a>
  </span>

  <xsl:text> </xsl:text>
  <span class="trdnac">
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

-->

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














