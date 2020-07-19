<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		version="1.0">


<!-- (c) 1999-2018 ĉe Wolfram Diestel 
     licenco GPL 2.0

Tiuj transformreguloj estas uzataj por la nova redaktilo Cetonio. Ĝi ne uzas kelkajn XSLT 2 - regulojn por povi uzi
la transformilon "xsltproc" anstataŭ Saxon, kiu aldone bezonas instalitan Javo-VM. XSLT 1 sufiĉas por la
antaŭrigardo.

revohtml1.xsl kaj revohtml.xsl estas preskaŭ identaj, estas iu diferenco ekz. en bibliografio-pado,
necesus testi, ĉu oni povus anstataŭe uzi revohtml1.xl en ambaŭ redaktiloj nova kaj malnova...

Tie ĉi troviĝas nur variabloj por agordo kaj la importkomandoj por la unuopaj dosieroj, kie enestas la
transform-reguloj.

-->


<xsl:import href="inc/revo_trd.xsl"/>
<xsl:import href="inc/revo_fnt.xsl"/>
<xsl:import href="inc/revo_adm.xsl"/>
<xsl:import href="inc/revo_kap.xsl"/>
<xsl:import href="inc/revo_art.xsl"/>
<xsl:import href="inc/revo_ref.xsl"/>
<xsl:import href="inc/revo_dif.xsl"/>

<xsl:param name="xml-ref-pado"/>

<xsl:output method="html" version="4.0" encoding="utf-8"/>
<xsl:strip-space elements="trdgrp refgrp kap"/>


<!-- kelkaj variabloj  -->

<xsl:variable name="mathjax-url">https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=AM_CHTML</xsl:variable>
<xsl:variable name="art-css">artikolo-1b.css</xsl:variable>

<xsl:variable name="smbdir">../smb</xsl:variable>
<xsl:variable name="xmldir">../xml</xsl:variable> 
<xsl:variable name="cssdir">../stl</xsl:variable>
<xsl:variable name="redcgi">/cgi-bin/vokomail.pl?art=</xsl:variable>
<xsl:variable name="vivocgi">http://kono.be/cgi-bin/vivo/ViVo.cgi?tradukiReVon=</xsl:variable>
<xsl:variable name="bibliografio">../../cfg/bibliogr.xml</xsl:variable>
<xsl:variable name="bibliogrhtml">../dok/bibliogr.html</xsl:variable>
<xsl:variable name="revo">/home/revo/revo</xsl:variable>
<xsl:variable name="lingvoj_cfg" select="'../../cfg/lingvoj.xml'"/>
<xsl:variable name="klasoj_cfg" select="'../../cfg/klasoj.xml'"/>
<xsl:variable name="fakoj_cfg" select="'../../cfg/fakoj.xml'"/>
<xsl:variable name="permesoj_cfg" select="'../../cfg/permesoj.xml'"/>
<xsl:variable name="arhhivo" select="'http://www.reta-vortaro.de/cgi-bin/historio.pl?art='"/>

<!-- ilustrite por HTML kun grafikoj ktp.
     simple por HTML tauga por konverto al simpla teksto -->
<xsl:variable name="aspekto" select="'ilustrite'"/>

<xsl:template name="eo-kodigo">
  <xsl:param name="str"/>
  <xsl:value-of select="$str"/> 
</xsl:template>


<xsl:template match="sncref">
  <!-- Se ne ekzistas la XML-dosiero, la tuta transformado fiaskas cxe
  xt -->
  <xsl:variable name="ref" select="(@ref|ancestor::ref/@cel)[last()]"/>
<!-- 
  <xsl:variable name="doc" select="concat($xml-ref-pado,'/',substring-before($ref,'.'),'.xml')"/>
  <xsl:message>ref: <xsl:value-of select="$ref"/> doc: <xsl:value-of select="$doc"/></xsl:message> 
--> 
  <xsl:choose>
    <xsl:when test="substring-before($ref,'.') = substring-before(ancestor::node()[@mrk][1]/@mrk,'.')">
      <sup><i>
      <xsl:apply-templates mode="number-of-ref-snc"
        select="//node()[@mrk=$ref]"/>
      </i></sup>
    </xsl:when>
    <xsl:otherwise>
      <sup>&#x21b7;</sup>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


</xsl:stylesheet>












