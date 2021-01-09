<!DOCTYPE xsl:transform>

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:saxon="http://saxon.sf.net/"
  xmlns:voko="http://reta-vortaro.de/"
  version="2.0"
  extension-element-prefixes="saxon" 
>

<xsl:variable name="ord">
    <lingvo lng="test" silab=".">
    <l name="k"><g>k</g><g>gk</g><g>cgk</g></l>
    <l name="g"><g>g</g><g>gcx</g><g>cg</g></l>
    <l name="c"><g>c</g><g>gc</g></l>
    <l name="j"><g>j</g><g>gcj</g></l>
    </lingvo>
</xsl:variable>

<!-- ekzemplo de funkcio en XSL: https://www.xml.com/pub/a/2003/09/03/trxml.html -->
<!-- ni devos difini la funkcion tiel, ke ĉi sekvas la regulojn de silaba ordigo -->
<xsl:function name="voko:ordigo-sub">
    <xsl:param name="vorto"/> 
    <xsl:param name="s"/> 
    <xsl:variable name="silabo" select="substring-before(concat($vorto,$s),$s)"/>
    <xsl:sequence select="'k'"/>
</xsl:function>

<xsl:template match="vortoj">
  <!-- la vortlisto -->
  <xsl:variable name="Vj" select="."/>
  <!-- la silabiga signo -->
  <xsl:variable name="s" select="ord/lingvo[@lng='test']/@silab"/>

  <!-- testetoj -->
  Tx:[<xsl:value-of select="voko:ordigo-sub('x',$s)"/>]
  Tk:[<xsl:value-of select="voko:ordigo-sub('k',$s)"/>]

  <xsl:for-each select="$ord/lingvo[@lng='test']/l">
    LIT:[<xsl:value-of select="@name"/>
    <xsl:apply-templates select="$Vj/t[voko:ordigo-sub(.,$s)=current()/@name]"/>
    <!-- xsl:apply-templates select="$Vj/t"/ -->
    <xsl:text>] </xsl:text>
  </xsl:for-each>
</xsl:template>

<xsl:template match="t">
  <xsl:apply-templates/>
  <xsl:text>; </xsl:text>
</xsl:template>




</xsl:transform>