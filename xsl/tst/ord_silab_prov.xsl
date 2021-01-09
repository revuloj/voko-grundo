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
    <xsl:param name="lingvo"/> 

    <!-- la ordigdifinoj por la lingvo -->
    <!--xsl:message select="'lingvo: ',$lingvo"/ -->
    <xsl:variable name="lng" select="$ord/lingvo[@lng=$lingvo]"/>

    <!-- la silabiga signo -->
    <xsl:variable name="s" select="$lng/@silab"/>     

    <!-- la unua (aŭ sola) silabo de la vorto -->
    <xsl:variable name="silabo" select="substring-before(concat($vorto,$s),$s)"/>
    <xsl:message select="'silabo: ',$silabo"/>

    <!-- unua alproksimiĝo: ĉiam redonu la unua literon 
    <xsl:sequence select="$lng/l[1]/@name"/ -->

    <!-- dua alproksimiĝo: trovu la unuan literon, 
    kie iu grupo koincidas kun la komenco de la silabo -->
    <xsl:sequence select="$lng/l/g[starts-with($silabo,.)][1]/../@name"/>
</xsl:function>

<xsl:template match="vortoj">
  <!-- la vortlisto -->
  <xsl:variable name="Vj" select="."/>
  <!-- la lingvo laŭ kiu ni ordigas -->
  <!-- xsl:variable name="lng" select="$ord/lingvo[@lng='test']"/ -->
  <xsl:variable name="lng" select="'test'"/>

  <!-- testetoj -->
  Tk:[<xsl:value-of select="voko:ordigo-sub('k',$lng)"/>]
  Tcg:[<xsl:value-of select="voko:ordigo-sub('cg',$lng)"/>]
  Tx:[<xsl:value-of select="voko:ordigo-sub('x',$lng)"/><xsl:text>]
-----------------------------  
Atendata rezulto:
k:[kaa; ka.ja; gka; gka.ja]
g:[]
c:[ca.ga; caua.kaa]
j:[]
-----------------------------
</xsl:text>

  <xsl:for-each select="$ord/lingvo[@lng=$lng]/l">

<xsl:value-of select="@name"/><xsl:text>:[</xsl:text>
    <xsl:apply-templates select="$Vj/t[voko:ordigo-sub(.,$lng)=current()/@name]"/>
    <!-- xsl:apply-templates select="$Vj/t"/ -->
    <xsl:text>]
</xsl:text>
  </xsl:for-each>
</xsl:template>

<xsl:template match="t">
  <xsl:apply-templates/>
  <xsl:text>; </xsl:text>
</xsl:template>




</xsl:transform>