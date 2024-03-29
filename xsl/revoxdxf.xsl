<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		version="1.0">


<!-- (c) 2015-2020 ĉe Wolfram Diestel 
     permesilo GPL 2.0

reguloj por XDXF universala vortar-intershangha formato

-->
<!--
<xsl:import href="revo_trd.xsl"/>
<xsl:import href="revo_fnt.xsl"/>
<xsl:import href="revo_adm.xsl"/>
<xsl:import href="revo_kap.xsl"/>
<xsl:import href="revo_art.xsl"/>
<xsl:import href="revo_ref.xsl"/>
<xsl:import href="revo_dif.xsl"/>
-->

<xsl:import href="inc/revo_kap.xsl"/>
<!-- xsl:import href="revo_ref.xsl"/ -->

<xsl:output method="xml" encoding="utf-8" indent="yes"/>
<xsl:strip-space elements="trdgrp refgrp kap drv art snc"/>


<!-- kelkaj variabloj -->

<xsl:variable name="mathjax-url">https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=AM_CHTML</xsl:variable>
<xsl:variable name="art-css">artikolo-1b.css</xsl:variable>
<xsl:variable name="art-jsc">revo-art-1b.js</xsl:variable>

<xsl:variable name="cssdir">/revo/stl</xsl:variable>
<xsl:variable name="jscdir">/revo/jsc</xsl:variable>

<xsl:variable name="smbdir">../smb</xsl:variable>
<xsl:variable name="xmldir">../xml</xsl:variable> 
<!-- xsl:variable name="cssdir">../stl</xsl:variable -->
<!-- xsl:variable
name="redcgi">/cgi-bin/vokomail.pl?art=</xsl:variable -->
<xsl:variable name="bibliografio">../../../revo/cfg/bibliogr.xml</xsl:variable>
<xsl:variable name="bibliogrhtml">../../../revo/dok/bibliogr.xml</xsl:variable>
<xsl:variable name="revo">/home/revo/revo</xsl:variable>
<xsl:variable name="lingvoj_cfg" select="'../cfg/lingvoj.xml'"/>
<xsl:variable name="klasoj_cfg" select="'../../../revo/cfg/klasoj.xml'"/>
<xsl:variable name="fakoj_cfg" select="'../cfg/fakoj.xml'"/>

<!-- ilustrite por HTML kun grafikoj ktp.
     simple por HTML tauga por konverto al simpla teksto -->
<xsl:variable name="aspekto" select="'simple'"/>


<!-- apartaj reguloj por bedic-formato -->

<xsl:template match="/">
<!--
<!DOCTYPE xdxf SYSTEM
"https://raw.github.com/soshial/xdxf_makedict/master/format_standard/xdxf_strict.dtd">

  <xdxf lang_from="ESP" lang_to="ESP" format="logical" revision="0.1">
    <meta_info>
        <title>Reta Vortaro</title>
        <full_title>Reta Vortaro</full_title>
        <description>Reta Vortaro de Esperanto kun difinoj kaj tradukoj</description>
        <abbreviations>
          <abbr_def><abbr_k>tr.</abbr_k> <abbr_v>transitiva verbo</abbr_v></abbr_def>
          <abbr_def><abbr_k>ntr.</abbr_k> <abbr_v>netransitiva verbo</abbr_v></abbr_def>
        </abbreviations>
        <file_version>001</file_version>
        <creation_date>2015-04-14</creation_date>
    </meta_info>
    <lexicon>
-->
       <xsl:apply-templates select="//art"/>
<!--
    </lexicon>
</xdxf>
-->
 
</xsl:template>

<xsl:template match="//art">
  <xsl:choose>
    <xsl:when test="drv">
      <xsl:apply-templates select="drv"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates select="//drv"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


<xsl:template match="subart">
<!--  <def>
    <xsl:number format="I."/> -->
    <xsl:apply-templates/>
<!--  </def> -->
</xsl:template>

<xsl:template match="drv">
  <ar>
     <xsl:apply-templates select="kap"/>
     <xsl:choose>
         <xsl:when test="not(snc|subdrv)">
           <def>
             <xsl:apply-templates select="uzo|dif|ekz"/>
             <xsl:if test="refgrp|ref">
               <sr>
                 <xsl:apply-templates select="refgrp|ref"/>
               </sr><br/>
             </xsl:if>
             <xsl:apply-templates select="trdgrp|trd"/>
           </def>
         </xsl:when>
         <xsl:otherwise>
           <xsl:apply-templates select="subdrv|snc|snc/subsnc"/>
           <xsl:apply-templates select="trdgrp|trd"/>
         </xsl:otherwise>
     </xsl:choose>
  </ar>
</xsl:template>

<xsl:template match="subdrv">
  <def>
    <xsl:number from="drv|subart" level="any" count="subdrv" format="A."/>
    <xsl:text> </xsl:text>
    <xsl:apply-templates select="uzo|dif|ekz"/>
    <xsl:apply-templates select="snc|snc/subsnc"/>
    <xsl:if test="refgrp|ref">
      <sr>
        <xsl:apply-templates select="refgrp|ref"/>
      </sr><br/>
    </xsl:if>
    <xsl:apply-templates select="trdgrp|trd"/>
  </def>
</xsl:template>

<xsl:template match="snc|subsnc">
  <def>
    <xsl:if test="count(ancestor::node()[self::drv or self::subart][1]//snc)>1 
      and not(ancestor::node()[self::subdrv])">
      <xsl:number from="drv|subart" level="multiple" count="snc|subsnc" format="1.a"/>
      <xsl:text> </xsl:text>
    </xsl:if>
    <xsl:apply-templates select="uzo|dif|ekz"/>
    <xsl:if test="refgrp|ref">
      <sr>
        <xsl:apply-templates select="refgrp|ref"/>
      </sr><br/>
    </xsl:if>
    <xsl:apply-templates select="trdgrp|trd"/>
  </def>
</xsl:template>

<xsl:template match="ekz">
  <ex>
    <xsl:choose>
      <xsl:when test="fnt/bib">
         <xsl:attribute name="source">
            <xsl:value-of select="fnt/bib"/> 
         </xsl:attribute>
      </xsl:when>
      <xsl:when test="fnt[not(bib|vrk|aut|lok)]">
         <xsl:attribute name="source">
           <xsl:value-of select="fnt"/> 
         </xsl:attribute>
      </xsl:when>
    </xsl:choose>
    <xsl:apply-templates/>
  </ex>
</xsl:template>

<!--   
                <tr>'həum</tr>
                <gr><abbr>n.</abbr></gr><rref start="16384" size="512">sounds_of_words.ogg</rref>
                <def>One's own dwelling place; the house in which one lives.</def>
                <def>One's native land; the place or country in which one dwells.</def>
                <def>
                    The abiding place of the affections.
                    <ex>For without hearts there is no home.</ex>
                </def>
                <def>
                    <dtrn>дом</dtrn>, at home - дома, у себя;
                    <ex>
                        <ex_orig>make yourself at <mrkd>home</mrkd></ex_orig>
                        <ex_tran>будьте как <mrkd>дома</mrkd></ex_tran>
                    </ex>
                    <categ>Society</categ>
                </def>
                <co>XDXF <iref href="http://xdxf.sourceforge.net"><b>Home</b> page</iref></co>
                See also: <kref type="rel">home-made</kref>
            </def>
        </ar>
        <ar>
            <k>indices</k>
            <def>
                Plural form of word <kref>index</kref>
            </def>
        </ar>
        <ar>
            <k>disc</k>
            <k>disk</k>
            <def>
                <gr><abbr>n.</abbr></gr>
                A flat, circular plate; as, a disk of metal or paper.
            </def>
        </ar>
        <ar>
            <k>CO<sub>2</sub></k>
            <def>
                Carbon dioxide (CO<sub>2</sub>) - a heavy odorless gas formed during respiration.
            </def>
        </ar>
-->

<!-- 
  Pliaj lingvoj laŭ: https://github.com/revuloj/voko-formiko/issues/10
  Franca, Itala, Portugala, Latineca, Greka, Sveda, Angla, Bretona, Bulgara, Kataluna, Nederlanda,
  Persa, Pola, Rumana, Rusa, Slovaka:

  fr, it, pt, la, el, sv, en, br, bg, ca, nl, fa, pl, ro, ru, sk
-->

<xsl:template match="trdgrp[(
  parent::snc or 
  parent::drv or 
  parent::subdrv
  ) and (
  @lng='la' or 
  @lng='de' or 
  @lng='en' or
  @lng='es' or 
  @lng='ru' or
  @lng='fr' or 
  @lng='hu' or 
  @lng='be' or
  @lng='it' or 
  @lng='pt' or 
  @lng='el' or 
  @lng='sv' or 
  @lng='br' or 
  @lng='bg' or 
  @lng='ca' or 
  @lng='nl' or 
  @lng='fa' or 
  @lng='pl' or 
  @lng='ro' or 
  @lng='sk' or 
  @lng='cs' 
  )]">
  <dtrn>
    <xsl:text>/</xsl:text>
    <xsl:value-of select="@lng"/>
    <xsl:text>/ </xsl:text>
    <xsl:apply-templates/>
  </dtrn>
<!--
  <xsl:choose>
    <xsl:when test="not(position()=last())"> <!- ne funkcias ghuste pro limigo de
      lingvoj... ->
      <xsl:text>; </xsl:text>
    </xsl:when>
    <xsl:otherwise>
      <xsl:text>. </xsl:text> 
    </xsl:otherwise>
  </xsl:choose>
-->
</xsl:template>

<xsl:template match="trd[(
  parent::snc or 
  parent::drv or 
  parent::subdrv
  ) and (
  @lng='la' or 
  @lng='de' or 
  @lng='en' or 
  @lng='es' or 
  @lng='ru' or 
  @lng='fr' or 
  @lng='hu' or 
  @lng='be' or
  @lng='it' or 
  @lng='pt' or 
  @lng='el' or 
  @lng='sv' or 
  @lng='br' or 
  @lng='bg' or 
  @lng='ca' or 
  @lng='nl' or 
  @lng='fa' or 
  @lng='pl' or 
  @lng='ro' or 
  @lng='sk' or 
  @lng='cs' 
  )]">
  <dtrn>
    <xsl:text>/</xsl:text>
    <xsl:value-of select="@lng"/>
    <xsl:text>/ </xsl:text>
    <xsl:apply-templates/>
  </dtrn> 
<!--
  <xsl:choose>
    <xsl:when test="not(position()=last())">  <!- ne funkcias ghusto pro limigo de
      lingvoj... ->
      <xsl:text>; </xsl:text>
    </xsl:when>
    <xsl:otherwise>
      <xsl:text>. </xsl:text>
    </xsl:otherwise>
  </xsl:choose>
-->
</xsl:template>

<xsl:template match="dif/trd|rim/trd|trdgrp/trd">
  <xsl:apply-templates/>
</xsl:template>

<!-- tradukoj en ekzemploj ne funkcias en xdxf...? -->
<xsl:template match="ekz/trd|ekz/trdgrp"/>

<!-- aliajn lingvojn au tradukojn en aliaj lokoj ignoru... -->
<xsl:template match="trdgrp|trd"/>

<!-- xsl:template match="kap/ofc|kap/fnt"/ -->

<xsl:template match="kap/ofc|kap/fnt">
  [<xsl:apply-templates/>]
</xsl:template>

<!-- eble inkluzivu revo_ref.xsl anstataue, sed solvu problemon kun
inx_kodigo.inc (saxon) -->

<xsl:template name="reftip">
  <xsl:text> </xsl:text>
  <xsl:choose>
    <xsl:when test="@tip='vid'">
      <xsl:text>VD:</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='dif'">
      <xsl:text>=</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='sin'">
      <xsl:text>SIN:</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='ant'">
      <xsl:text>ANT:</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='super'">
      <xsl:text>SUP:</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='sub'">
      <xsl:text>SUB:</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='prt'">
      <xsl:text>PRT:</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='malprt'">
      <xsl:text>TUT:</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='hom'">
      <xsl:text>HOM:</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='lst'">
      <xsl:text>LST:</xsl:text>
    </xsl:when>
    <xsl:when test="@tip='ekz'">
      <xsl:text>EKZ:</xsl:text>
    </xsl:when>
  </xsl:choose>
  <xsl:text> </xsl:text>
</xsl:template>

<xsl:template name="kref-type">
  <xsl:param name="tip"/>
  <xsl:choose>
    <xsl:when test="$tip='dif'">
      <xsl:value-of select="'syn'"/>
    </xsl:when>
    <xsl:when test="$tip='sin'">
      <xsl:value-of select="'syn'"/>
    </xsl:when>
    <xsl:when test="$tip='ant'">
      <xsl:value-of select="'ant'"/>
    </xsl:when>
    <xsl:when test="$tip='super'">
      <xsl:value-of select="'hpr'"/>
    </xsl:when>
    <xsl:when test="$tip='sub'">
      <xsl:value-of select="'hpn'"/>
    </xsl:when>
    <xsl:when test="$tip='prt'">
      <xsl:value-of select="'mer'"/>
    </xsl:when>
    <xsl:when test="$tip='malprt'">
      <xsl:value-of select="'hol'"/>
    </xsl:when>
    <xsl:when test="$tip='hom'">
      <xsl:value-of select="'par'"/>
    </xsl:when>
    <xsl:when test="$tip='lst'">
      <xsl:value-of select="'hpr'"/>
    </xsl:when>
    <xsl:when test="$tip='ekz'">
      <xsl:value-of select="'hpn'"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="'rel'"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="refgrp">
  <xsl:if test="not(ancestor::dif)">
    <xsl:call-template name="reftip"/>
  </xsl:if>
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="ref">
  <xsl:if test="not(ancestor::dif)">
    <xsl:call-template name="reftip"/>
  </xsl:if>
  <kref>
    <xsl:attribute name="type">
      <xsl:call-template name="kref-type">
        <xsl:with-param name="tip" select="ancestor-or-self::node()/@tip"/>
      </xsl:call-template>
    </xsl:attribute>
    <xsl:apply-templates/>
  </kref>
</xsl:template>

<xsl:template match="sup">
  <sup>
    <xsl:value-of select="."/>
  </sup>
</xsl:template>

<xsl:template match="sub">
  <sub>
    <xsl:value-of select="."/>
  </sub>
</xsl:template>

<xsl:template match="ofc|fnt"/>
<!--
  <xsl:text>[</xsl:text>
  <xsl:value-of select="."/>
  <xsl:text>]</xsl:text>
</xsl:template> -->

<xsl:template match="fnt[bib]">
  <xsl:text>[</xsl:text>
  <xsl:apply-templates select="bib"/>
  <xsl:text>]</xsl:text>
</xsl:template>

<xsl:template match="fnt[text() and not(bib or vrk)]">
  <xsl:text>[</xsl:text>
  <xsl:apply-templates select="text()"/>
  <xsl:text>]</xsl:text>
</xsl:template>

<xsl:template match="url">
  <iref href="{@ref}">
    <xsl:apply-templates/>
  </iref>
</xsl:template>

<xsl:template match="em">
  <i><xsl:apply-templates/></i>
</xsl:template>

<xsl:template name="admin"/>
<!--  <hr />
  <xsl:call-template name="redakto"/>
</xsl:template -->

<xsl:template match="drv[1]/kap">
  <k>
    <xsl:apply-templates select="text()|rad|tld"/>

    <!-- la unua derivaĵo montras la oficilecon de la radiko (art/kap),
        kiam ne enestas aparta drv/kap/ofc -->

    <!-- kauzas problemojn en Easy XDXF Dict: ??? -->
    <xsl:for-each select="(ofc|//art/kap/ofc)[1]">
      <opt><xsl:text>[</xsl:text>
      <xsl:value-of select="."/>
      <xsl:text>]</xsl:text></opt>
    </xsl:for-each>
    <xsl:if test="fnt">
      <opt>
        <xsl:apply-templates select="fnt"/>
      </opt>
    </xsl:if>
  </k>
  <xsl:apply-templates select="var/kap"/>
</xsl:template>


<xsl:template match="drv[position()>1]/kap">
  <k>
    <xsl:apply-templates select="text()|rad|tld"/>
    <!-- kauzas problemojn en Easy XDXF Dict: ??? -->
    <xsl:if test="ofc|fnt">
      <opt>
      <xsl:apply-templates select="ofc|fnt"/>
      </opt>
    </xsl:if>
  </k>
  <xsl:apply-templates select="var/kap"/>
</xsl:template>


<xsl:template match="var/kap">
  <k>
    <xsl:apply-templates select="text()|rad|tld"/>
    <!-- kauzas problemojn en Easy XDXF Dict: ??? -->
    <xsl:if test="ofc|fnt">
      <opt>
        <xsl:apply-templates select="ofc|fnt"/>
      </opt>
    </xsl:if>
  </k>
</xsl:template>

<xsl:template match="kap/text()">
  <xsl:value-of select="translate(.,',','')"/>
</xsl:template>


<xsl:template match="uzo">
  <xsl:value-of select="."/>
  <xsl:text> </xsl:text>
</xsl:template>


<xsl:template match="rim">
  <co>
    <xsl:apply-templates/>
  </co>
</xsl:template>

<!-- forprenas tro multe da spacoj... 
<xsl:template match="text()">
  <xsl:value-of select="normalize-space(.)"/>
</xsl:template>
 -->

<xsl:template name="eo-kodigo">
  <xsl:param name="str"/>
  <xsl:value-of select="$str"/> 
</xsl:template>


</xsl:stylesheet>
