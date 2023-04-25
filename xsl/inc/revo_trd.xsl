<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		version="1.0">

<!-- (c) 1999-2022 ĉe Wolfram Diestel 
     laŭ GPLv2

reguloj por prezentado de la tradukoj

-->

<!-- lingvo-informojn memoru en variablo por pli facila aliro -->
<!-- tio kaŭzas problemon kun sort en xalan : 
<xsl:variable name="lingvoj" select="document($lingvoj_cfg)/lingvoj"/ -->


<!-- tradukoj -->

<!-- ne montru tradukojn en la teksto, sed malsupre en propra alineo -->
<xsl:template match="trdgrp|trd"/>

<!-- nur tradukojn ene de difino kaj bildo montru tie, ĉar ili estas esenca parto de tiuj,
    aliajn ni kunkolektas piede de la derivaĵo --> 

<xsl:template match="dif/trd|bld/trd">
  <i><xsl:apply-templates/></i>
</xsl:template>

<!-- tion ni vokas per sia nomo el la transformregulo por drv kaj subart -->
<xsl:template name="tradukoj">
  <xsl:if test=".//trd">
    <xsl:variable name="self" select="."/>
    <section class="tradukoj">
      <dl class="tradukoj etendebla">
        <!-- elektu por ĉiu lingvo unu reprezentanton -->
        <xsl:for-each select="document($lingvoj_cfg)/lingvoj/lingvo">
          <xsl:sort lang="eo"/>
          <xsl:variable name="lng" select="@kodo"/>
          <!-- adverbigita lingvonomo -->
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
      </dl>
    </section>
  </xsl:if>
</xsl:template>

<!-- traktas la tradukojn de unuopa lingvo -->

<xsl:template name="lingvo">
  <xsl:param name="lng"/>
  <xsl:param name="lingvo"/>

  <xsl:choose>
    <!-- TRADUKOJ ENE DE drv -->
    <xsl:when test="self::drv">
      <xsl:if test=".//trd[@lng=$lng]|.//trdgrp[@lng=$lng]">
        <dt lang="eo" class="lng"><xsl:value-of select="$lingvo"/>:</dt>
        <dd lang="{$lng}">
        <!--          
          eta ĝenaĵo: se senco kaj ekzemplo ene havas tradukojn, ili aperas kun cifero de la senco,
          se nur ekzemplo aperas, la cifero mankas.
          Oni povus solvi tion, demandante ĉu la senco havas samlingvan tradukon, 
          sed necesus parametrigi la ŝablonojn vokatajn ene de la malsupra <strong>...</strong>
          per lingvo-parametro por atingi tion...
        -->
          <xsl:for-each select=".//trdgrp[@lng=$lng]|.//trd[@lng=$lng]">
            <!-- Ni ordigas la tradukojn laŭ profundeco en la strukturo, tiel ke ekz-e 
                 tradukoj de drv aperu antaŭ tiuj de drv/snc 
            <xsl:sort select="count(ancestor::node()[
              self::snc or 
              self::subsnc or
              self::drv or
              self::subdrv])" data-type="number"/>
            - - ene de la profundecniveloj ni ordigas laŭ la ordo de apero, ĉar por la profundeco
                 supre ni ne kunkalkulas ekz, ties tradukoj aperas antaŭ tiuj de snc, ĉu bone? - - 
            <xsl:sort select="position()" data-type="number"/> -->

            <!-- 1. ordigu laŭ ĉefa vicordo ene de la strukturo: drv unue, snc laste -->
            <xsl:sort select="string-length(substring-before('|snc|subdrv',local-name((ancestor::drv|ancestor::subdrv|ancestor::snc)[last()])))" 
              data-type="number" order ="descending"/>

            <!-- 2. ordigu snc/subsnc laŭ la ordo en kiu ili aperas en la dokumento -->
            <xsl:sort select="count(preceding::snc | preceding::subsnc | preceding::subdrv)" 
              data-type="number"/>

            <!-- 3. ordigu rektajn tradukojn (drv, snc dif) antaŭ nerektaj (bld/ekz) -->
            <xsl:sort select="count(parent::drv|parent::subdrv|parent::snc|parent::subsnc|parent::dif)" 
              data-type="number" order ="descending"/>

            <!-- 4. ordigu laŭ pozicio, t.e. ekz-o-tradukojn laŭ apero en la artikolo, verŝajne jam aŭtomate(?)
            <xsl:sort select="position()" data-type="number"/> -->

            <!-- PRIPENSU: ĉar temas pri nombroj oni povus ankaŭ adicii kaj ordigi en unu paŝo:
                -100*o + 2*p - r (necesus mezuri, ĉu tiel plirapidiĝus, verŝajne apenaŭ...)-->

<!--
              {o<xsl:value-of select="-string-length(substring-before('|snc|subdrv',local-name((ancestor::drv|ancestor::subdrv|ancestor::snc)[last()])))"/>
              p<xsl:value-of select="count(preceding::snc | preceding::subsnc | preceding::subdrv)"/>
              r<xsl:value-of select="-count(parent::drv|parent::subdrv|parent::snc|parent::subsnc|parent::dif)"/>}
-->

            <xsl:apply-templates select="." mode="tradukoj"/>
            <xsl:text> </xsl:text>
          </xsl:for-each>
        </dd>
      </xsl:if>
    </xsl:when>
    <!-- TRADUKOJ NE ENE DE drv, do fakte subart -->
    <xsl:otherwise>
      <!-- ni ne traktas tradukojn ene de subart/drv, ĉar tiuj jam traktiĝas per la ĉi-supra regulo -->
      <xsl:if test="trd[@lng=$lng]|trdgrp[@lng=$lng]
        |snc/trd[@lng=$lng]|snc/trdgrp[@lng=$lng]
        |snc//ekz/trd[@lng=$lng]|snc//ekz/trdgrp[@lng=$lng]">
        <dt lang="eo" class="lng"><xsl:value-of select="$lingvo"/>:</dt>
        <dd lang="{$lng}">
        <!--
          eta ĝenaĵo: se senco kaj ekzemplo ene havas tradukojn, ili aperas kun cifero de la senco,
          se nur ekzemplo aperas, la cifero mankas.
          Oni povus solvi tion, demandante ĉu la senco havas samlingvan tradukon, 
          sed necesus parametrigi la ŝablonojn vokatajn ene de la malsupra <strong>...</strong>
          per lingvo-parametro por atingi tion...
        -->
          <xsl:for-each select="trd[@lng=$lng]|trdgrp[@lng=$lng]
            |snc/trd[@lng=$lng]|snc/trdgrp[@lng=$lng]
            |snc//ekz/trd[@lng=$lng]|snc//ekz/trdgrp[@lng=$lng]">

            <!-- 1. ordigu laŭ ĉefa vicordo ene de la strukturo: subart unue, snc laste -->
            <xsl:sort select="string-length(substring-before('|snc|subdrv|subart',
              local-name((ancestor::subart|ancestor::drv|ancestor::subdrv|ancestor::snc)[last()])))" 
              data-type="number" order ="descending"/>

            <!-- 2. ordigu snc/subsnc laŭ la ordo en kiu ili aperas en la dokumento -->
            <xsl:sort select="count(preceding::snc | preceding::subsnc | preceding::subdrv | preceding::drv)" 
              data-type="number"/>

            <!-- 3. ordigu rektajn tradukojn (drv, snc dif) antaŭ nerektaj (bld/ekz) -->
            <xsl:sort select="count(parent::subart|parent::drv|parent::subdrv|parent::snc|parent::subsnc|parent::dif)" 
              data-type="number" order ="descending"/>

            <!-- 4. ordigu laŭ pozicio, t.e. ekz-o-tradukojn laŭ apero en la artikolo, verŝajne jam aŭtomate(?)
            <xsl:sort select="position()" data-type="number"/> -->

            <!-- PRIPENSU: ĉar temas pri nombroj oni povus ankaŭ adicii kaj ordigi en unu paŝo:
                -100*o + 2*p - r (necesus mezuri, ĉu tiel plirapidiĝus, verŝajne apenaŭ...)-->


<!--
              {o<xsl:value-of select="-string-length(substring-before('|snc|subdrv',local-name((ancestor::drv|ancestor::subdrv|ancestor::snc)[last()])))"/>
              p<xsl:value-of select="count(preceding::snc | preceding::subsnc | preceding::subdrv)"/>
              r<xsl:value-of select="-count(parent::drv|parent::subdrv|parent::snc|parent::subsnc|parent::dif)"/>}
-->

<!--            
            <! - - pri ordigo vd. supre - - >
            <xsl:sort select="count(ancestor::node()[
              self::snc or 
              self::subsnc or
              self::drv or
              self::subdrv])" data-type="number"/>
            <xsl:sort select="position()" data-type="number"/>

            -->
            <xsl:apply-templates select="." mode="tradukoj"/>
            <xsl:text> </xsl:text>
          </xsl:for-each>
        </dd>
      </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>  


<!-- traktas unuopan tradukon aŭ tradukgrupon
    (tio inkluzivas ankaŭ dif/trd, kiu montriĝas krom
    en la difino mem ankaŭ en la listo sube de drv) -->
<xsl:template match="trd[@lng]|trdgrp" mode="tradukoj">

  <!-- rigardu, al kiu subarbo apartenas la traduko kaj skribu la
	 tradukitan vorton/sencon -->
  <xsl:choose>
    <xsl:when test="ancestor::node()[self::ekz or self::bld]">
      <strong lang="eo" class="trdeo">
        <xsl:apply-templates 
          select="ancestor::node()[self::ekz or self::bld][1]" mode="kaptrd"/>
      </strong>
      <!-- uzu spacon ĉe ekz/bld, 0xA0 aliokaze -->
      <xsl:text> </xsl:text>      
    </xsl:when>
    <xsl:when test="not(
        parent::drv 
        or count(ancestor::node()[self::drv or self::subart][1]//snc)=1
      ) 
      or parent::subsnc">
      <strong lang="eo" class="trdeo">
        <xsl:apply-templates 
          select="ancestor::node()[
            self::snc or 
            self::subsnc][1]" mode="kaptrd"/>
      </strong>
      <!-- uzu spacon ĉe ekz/bld, 0xA0 aliokaze -->
      <xsl:text>&#xa0;</xsl:text>
    </xsl:when>
  </xsl:choose>

  <!-- skribu la tradukon mem --> 
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

  <xsl:if test="not(position()=last())">

    <!-- malĝusta loko, ni havs tiun nur ĉe pluraj trd en trdgrp...:
         do ni metas punkton malsupre.
    <xsl:if test="ancestor::node()[self::ekz or self::bld]">
      <xsl:text>;</xsl:text>
    </xsl:if>
     -->

    <xsl:text> </xsl:text>
  </xsl:if>

  <!-- finu pli longajn tradukojn de ekz/bld per
        punkto ĉar aparte se sekvas tradukoj de unusola sencoj
        mankus apartigo.
  -->
  <xsl:if test="ancestor::node()[self::ekz or self::bld]">
    <xsl:text>.</xsl:text>
  </xsl:if>

</xsl:template>

<!-- tradukoj ene de tradukgrupo -->
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

<xsl:template match="ofc" mode="tradukoj">
  <sup class="ofc"><xsl:value-of select="."/>
</sup></xsl:template>

<!--
<xsl:template match="trdgrp/trd">
  <xsl:apply-templates/>

  <xsl:variable name="komo">
    <xsl:choose>
      <!- - Ne validas por la hebrea. - ->
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
-->

<xsl:template match="klr[@tip='ind']"/>
   <!-- ne skribu indeksajn klarigojn tie cxi -->

<xsl:template match="baz"/>
<!--
  <xsl:text>/</xsl:text>
  <xsl:apply-templates/>
  <xsl:text>/</xsl:text>
</xsl:template>
-->


<xsl:template match="snc" mode="kaptrd">
    <xsl:choose>

      <xsl:when test="@ref">
        <xsl:apply-templates mode="number-of-ref-snc" select="id(@ref)"/>:
      </xsl:when>

      <xsl:when test="count(ancestor::node()
        [self::drv or self::subart][1]//snc)>1">
        <xsl:number from="drv|subart" level="any" count="snc" format="1."/>
      </xsl:when>

    </xsl:choose>
</xsl:template>

<xsl:template match="subsnc" mode="kaptrd">
  <xsl:number from="drv|subart" level="multiple" count="snc|subsnc"
      format="1.a"/>
</xsl:template>

<!-- la sekvaj necesas nur por tradukoj en ekzemploj kaj bildoj -->

<xsl:template match="ekz|bld" mode="kaptrd">
  <span class="ekztrd">
    <xsl:text> </xsl:text><xsl:apply-templates select="ind" mode="kaptrd"/>
  </span>
</xsl:template>

<xsl:template match="ind" mode="kaptrd">
  <xsl:choose>
    <xsl:when test="mll">
      <xsl:apply-templates select="mll" mode="kaptrd"/> 
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates mode="kaptrd"/>
    </xsl:otherwise>
  </xsl:choose>:
</xsl:template>

<xsl:template match="ind/mll" mode="kaptrd">
  <xsl:if test="@tip='fin' or @tip='mez'">
    <xsl:text>…</xsl:text>
  </xsl:if>
  <xsl:apply-templates mode="kaptrd"/>
  <xsl:if test="@tip='kom' or @tip='mez'">
    <xsl:text>…</xsl:text>
  </xsl:if>
</xsl:template>

<xsl:template match="tld" mode="kaptrd">
  <xsl:value-of select="@lit"/>
  <xsl:text>~</xsl:text>
</xsl:template>

</xsl:stylesheet>
