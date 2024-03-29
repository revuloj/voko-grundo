<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		version="1.0">


<!-- (c) 1999-2003 che Wolfram Diestel 
     licenco GPL 2.0

reguloj por simpla HTML tauga al transformado al
simpla teksto per lynx -dump -nolist

le rezulto entenas nur la esperantlingvajn partojn: dif, ekz, sed ne fnt, trd;
ghi estas uzata momente nur por kontrolado de la artikola teksto

tie chi trovighas nur variabloj por agordo, la
importkomandoj por la unuopaj dosieroj, kie enestas la
transform-reguloj kaj la esceptaj traktoj de unuopaj elementoj

-->

<!--
<xsl:import href="revo_trd.xsl"/>
<xsl:import href="revo_fnt.xsl"/>
<xsl:import href="revo_adm.xsl"/>
-->

<xsl:import href="inc/revo_kap.xsl"/>
<xsl:import href="inc/revo_art.xsl"/>
<xsl:import href="inc/revo_ref.xsl"/>
<xsl:import href="inc/revo_dif.xsl"/>

<xsl:output method="html" version="4.0" encoding="utf-8"/>
<xsl:strip-space elements="trdgrp refgrp kap"/>


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
<xsl:variable name="bibliogrhtml">../../../revo/dok/bibliogr.html</xsl:variable>
<xsl:variable name="revo">/home/revo/revo</xsl:variable>
<xsl:variable name="retadreso">https://www.reta-vortaro.de</xsl:variable>

<xsl:variable name="lingvoj_cfg" select="'../cfg/lingvoj.xml'"/>
<xsl:variable name="klasoj_cfg" select="'../../../revo/cfg/klasoj.xml'"/>
<xsl:variable name="fakoj_cfg" select="'../cfg/fakoj.xml'"/>
<xsl:variable name="permesoj_cfg" select="'../../cfg/permesoj.xml'"/>

<!-- ilustrite por HTML kun grafikoj ktp.
     simple por HTML tauga por konverto al simpla teksto -->
<xsl:variable name="aspekto" select="'simple'"/>


<!-- apartaj reguloj por simpla teksto, char mankas
     la rimedoj koloro kaj tiparstilo -->

<!--
<xsl:template match="ind//tld|ekz//tld">
  <xsl:value-of select="@lit"/>
  <xsl:text>~</xsl:text>
</xsl:template>
-->

<xsl:template match="sup">
  <xsl:text>^{</xsl:text>
  <xsl:value-of select="."/>
  <xsl:text>}</xsl:text>
</xsl:template>

<xsl:template match="sub">
  <xsl:text>_{</xsl:text>
  <xsl:value-of select="."/>
  <xsl:text>}</xsl:text>
</xsl:template>

<xsl:template match="ofc|fnt"/>

<!--
<xsl:template match="fnt[bib|aut|vrk|lok]">
  <xsl:text>[</xsl:text>
  <xsl:number level="any" count="fnt[bib|aut|vrk|lok]"/>
  <xsl:text>]</xsl:text>
</xsl:template>
-->

<xsl:template match="trdgrp|trd"/>

<xsl:template match="ref">
{<xsl:apply-templates/>}
</xsl:template>

<xsl:template match="refgrp">
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="url">
  <xsl:apply-templates/>
 <!-- (<xsl:value-of select="@ref"/>) -->
</xsl:template>

<xsl:template match="em">
  <strong>_<xsl:apply-templates/>_</strong>
</xsl:template>

<xsl:template match="rim/aut"/>

<xsl:template match="adm"/>

<xsl:template match="uzo"/>

<xsl:template name="admin">
  <xsl:text>[artikolversio:</xsl:text>
  <xsl:value-of 
      select="substring-before(substring-after(@mrk,',v'),'revo')"/>]
</xsl:template>
<xsl:template name="redakto"/>

<xsl:template name="tradukoj"/>
<xsl:template name="fontoj"/>
<xsl:template name="fontoj-art"/>

<xsl:template match="frm|nom|nac|esc">
  &#x29fc;<xsl:apply-templates/>&#x29fd;
</xsl:template>

<xsl:template name="eo-kodigo">
  <xsl:param name="str"/>
  <xsl:value-of select="$str"/> 
</xsl:template>


</xsl:stylesheet>












