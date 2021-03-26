<!DOCTYPE xsl:transform>

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:saxon="http://saxon.sf.net/"
  version="2.0"
  extension-element-prefixes="saxon" 
>

<!--
    (c) 2021 ĉe Wolfram Diestel
    laŭ permesilo GPL 2.0

    Kreu liston ligantan markojn de Revo-kapvortoj al Viki-paĝoj.
    La Revo-kapvortojn ni legas el inx_kat.xml, kiu keiĝas dum la indekskreado kaj
    la Viki-titolojn el dosiero, kiun ni kreis aparte el titololisto elŝutita de Vikipedio

voku ekz-e:
    saxonb-xslt -xsl:xsl/revo_viki.xsl -s:/home/revo/tmp/inx_tmp/inx_kat.xml

-->

<xsl:variable name="viki_xml" select="'../tmp/vikilist.xml'"/>
<xsl:variable name="viki" select="document($viki_xml)/viki"/>

<xsl:template match="/">
    <vikiref>
        <xsl:apply-templates select="indekso/kap-oj[@lng='eo']/v"/>
    </vikiref>
</xsl:template>

<xsl:template match="v">
    <xsl:variable name="mrk" select="@mrk"/>
    <xsl:for-each select="$viki/v[lower-case(.)=lower-case(current()/k)]">
        <r v="{.}" r="{$mrk}"/>
    </xsl:for-each>
</xsl:template>

</xsl:transform>