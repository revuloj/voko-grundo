<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		version="1.0">


<!-- (c) 1999-2018 che Wolfram Diestel 
     licenco GPL 2.0

tie chi trovighas nur variabloj por agordo kaj la
importkomandoj por la unuopaj dosieroj, kie enestas la
transform-reguloj

-->

<xsl:import href="inc/inx_kodigo.inc"/>

<xsl:import href="inc/revo_trd.xsl"/>
<xsl:import href="inc/revo_fnt.xsl"/>
<xsl:import href="inc/revo_adm.xsl"/>
<xsl:import href="inc/revo_kap.xsl"/>
<xsl:import href="inc/revo_art2.xsl"/>
<xsl:import href="inc/revo_ref.xsl"/>
<xsl:import href="inc/revo_dif.xsl"/>

<xsl:param name="xml-ref-pado"/>
<xsl:param name="agordo-pado"/>


<xsl:output method="html" version="4.0" encoding="utf-8"/>
<xsl:strip-space elements="trdgrp refgrp kap"/>

<!-- agordo-dosieroj kies enhavo estas uzata en la XSL-reguloj -->
<xsl:variable name="bibliografio"><xsl:value-of select="concat($agordo-pado,'/bibliogr.xml')"/></xsl:variable>
<xsl:variable name="klasoj_cfg"><xsl:value-of select="concat($agordo-pado,'/klasoj.xml')"/></xsl:variable>
<xsl:variable name="lingvoj_cfg" select="'../../cfg/lingvoj.xml'"/>
<xsl:variable name="fakoj_cfg" select="'../../cfg/fakoj.xml'"/>
<xsl:variable name="permesoj_cfg" select="'../../cfg/permesoj.xml'"/>

<!-- padoj por referencado -->
<xsl:variable name="mathjax-url">https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=AM_CHTML</xsl:variable>
<xsl:variable name="sgn-font-url">../jsc/sgn-font.js</xsl:variable>
<xsl:variable name="sgn-fsw-url">../jsc/sgn-fsw.js</xsl:variable>
<xsl:variable name="art-css">artikolo-2m.css</xsl:variable>
<xsl:variable name="art-jsc">revo-art-2m.js</xsl:variable>

<xsl:variable name="smbdir">../smb</xsl:variable>
<xsl:variable name="xmldir">../xml</xsl:variable> 
<xsl:variable name="cssdir">../stl</xsl:variable>
<xsl:variable name="jscdir">../jsc</xsl:variable>
<xsl:variable name="hstdir">../hst</xsl:variable>

<xsl:variable name="redcgi">../index.html?r=</xsl:variable>
<xsl:variable name="vivocgi">http://kono.be/cgi-bin/vivo/ViVo.cgi?tradukiReVon=</xsl:variable>
<xsl:variable name="bibliogrhtml">../dok/bibliogr.html</xsl:variable>
<xsl:variable name="revo">/home/revo/revo</xsl:variable>
<xsl:variable name="retadreso">https://www.reta-vortaro.de</xsl:variable>

<!-- ilustrite por HTML kun grafikoj ktp.
     simple por HTML tauga por konverto al simpla teksto -->
<xsl:variable name="aspekto" select="'ilustrite'"/>


<xsl:template match="sncref">
  <!-- Se ne ekzistas la XML-dosiero, la tuta transformado fiaskas cxe
  xt -->
  <xsl:variable name="ref" select="(@ref|ancestor::ref/@cel)[last()]"/>
  <xsl:variable name="doc" select="concat($xml-ref-pado,'/',substring-before($ref,'.'),'.xml')"/>

<!-- <xsl:message>ref: <xsl:value-of select="$ref"/> doc: <xsl:value-of select="$doc"/></xsl:message> --> 

  <xsl:choose>
    <xsl:when test="doc-available($doc)">
      <sup><i>
	<xsl:apply-templates mode="number-of-ref-snc"
			   select=
			   "document($doc,/)//node()[@mrk=$ref]"/>
      </i></sup>
    </xsl:when>
    <xsl:otherwise>
      <sup>&#x21b7;</sup>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


</xsl:stylesheet>












