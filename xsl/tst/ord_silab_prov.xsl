<!DOCTYPE xsl:transform>

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:saxon="http://saxon.sf.net/"
  xmlns:voko="http://reta-vortaro.de/"
  version="2.0"
  extension-element-prefixes="saxon" 
>

<xsl:variable name="ord">
  <lingvo lng="test-max" metod="max-prefix">
    <l name="k"><g>k</g><g>gk</g><g>cgk</g></l>
    <l name="g"><g>g</g><g>gcx</g><g>cg</g></l>
    <l name="c"><g>c</g><g>gc</g></l>
    <l name="j"><g>j</g><g>gcj</g></l>
  </lingvo>

  <lingvo lng="test-n" metod="n-prefix">
    <l name="gk" n="2">GK,gk,gc</l>
    <l name="c">Cc</l>
    <l name="g" minus="gk">Gg</l>
    <l name="j">Jj</l>
  </lingvo>

</xsl:variable>

<!-- ekzemplo de funkcio en XSL: https://www.xml.com/pub/a/2003/09/03/trxml.html -->
<!-- ni devos difini la funkcion tiel, ke ĉi sekvas la regulojn de silaba ordigo -->
<xsl:function name="voko:max-prefix">
    <xsl:param name="vorto"/> 
    <xsl:param name="lingvo"/> 

    <!-- la ordigdifinoj por la lingvo -->
    <!--xsl:message select="'lingvo: ',$lingvo"/ -->
    <xsl:variable name="lng" select="$ord/lingvo[@lng=$lingvo]"/>

    <!-- NOTO: Ĉar la silabiga signo fakte ne aperas en la litergrupoj <g>..</g>,
         ni povas ŝpari la eltranĉon de la unua silabo kaj tuj kompari kun la tuta
         vorto(komenco)

    - - la unua (aŭ sola) silabo de la vorto - -
    <xsl:variable name="s" select="$lng/@silab"/>     
    <xsl:variable name="silabo" select="substring-before(concat($vorto,$s),$s)"/>
    <xsl:message select="'silabo: ',$silabo"/>
    -->

    <!-- kvara alproksimiĝo: kolektu ĉiujn literojn kaj ordigu laŭ longeco
         prenu la plej longan kiel unuan elementon -->
    <xsl:variable name="literoj">
      <xsl:for-each select="$lng/l/g[starts-with($vorto,.)]">
        <xsl:sort select="string-length()" order="descending" data-type="number"/>
        <xsl:sequence select=".."/>
      </xsl:for-each>
    </xsl:variable>
    <xsl:message select="string-join($literoj/l/@name,',')"/>
    <xsl:sequence select="$literoj/l[1]/@name"/> 

</xsl:function>


<xsl:function name="voko:n-prefix">
    <xsl:param name="vorto"/> 
    <xsl:param name="lingvo"/> 

    <!-- la ordigdifinoj por la lingvo -->
    <!--xsl:message select="'lingvo: ',$lingvo"/ -->
    <xsl:variable name="lng" select="$ord/lingvo[@lng=$lingvo]"/>
    <xsl:variable name="ignorendaj" select="concat('-(',$ord/lingvo[@lng=$lingvo]/@ignorendaj)"/>

    <xsl:message select="'vorto: ',$vorto"/>

    <xsl:variable name="literoj">
      <xsl:for-each select="$lng/l">

        <!-- longeco de la prefikso -->
        <xsl:variable name="n" select="number(substring(concat(@n,'1'),1,1))"/>

        <!-- esceptata prefikso: la sekva solvas la problemon ekz. en la hispana kaj kimra, 
             kie ordighas "Ll" en alian grupon ol "L", sed vortoj komencighantaj je "Ll" 
             ne aperu ankau sub "L" -->
        <xsl:variable name="minus" select="../l[@name=current()/@minus]"/> 
        <!-- longeco ne de la litergrupo kies nomo egalas al @minus de la momenta litergrupo
          ni bezonas por kompari la ĝustan nombron la literoj -->
        <xsl:variable name="nminus"
           select="number(substring(concat(../l[@name=current()/@minus]/@n,'1'),1,1))"/>     

        <!--xsl:message select="'l: ',@name,'dif: ',.,'n: ',$n, 'minus: ',$minus,' nmin: ',$nminus"/-->
        <xsl:message select="."/>
        <xsl:message select="substring(translate($vorto,$ignorendaj,''),1,$n)"/>
        <xsl:message select="'-',$minus,'-',substring($vorto,1,$nminus)"/>

        <!-- nur konsideru literojn, kie la vort-prefikso konvenas al la difino (n/minus) -->
        <xsl:if test="contains(.,
		          substring(translate($vorto,$ignorendaj,''),1,$n))">
<!--
              and not(contains($minus,substring($vorto,1,$nminus)))">
              -->               
          XXX<xsl:sequence select=".."/>
        </xsl:if>
      </xsl:for-each>
    </xsl:variable>

    <!-- redonu la unuan (solan) konvenan literon aŭ '?' -->
    <xsl:message select="'litj:',string-join($literoj/l/@name,',')"/>
    <xsl:sequence select="$literoj/l[1]/@name"/> 
</xsl:function>


<xsl:template match="vortoj">
  <!-- la vortlisto -->
  <xsl:variable name="Vj" select="."/>
  <!-- la lingvo laŭ kiu ni ordigas -->
  <!-- xsl:variable name="lng" select="$ord/lingvo[@lng='test']"/ -->
  <xsl:variable name="lng" select="'test-max'"/>

  <!-- testetoj -->
<!--
  Tk:[<xsl:value-of select="voko:max-prefix('k',$lng)"/>]
  Tcg:[<xsl:value-of select="voko:max-prefix('cg',$lng)"/>]
  Tx:[<xsl:value-of select="voko:max-prefix('x',$lng)"/><xsl:text>]
_______________________________  
Ordigo per max-prefix - atendata rezulto:
k:[kaa; ka.ja; gka; gka.ja]
g:[]
c:[ca.ga; caua.kaa]
j:[gcj.kaa]
_______________________________
</xsl:text>
-->  

<!--
  <xsl:for-each select="$ord/lingvo[@lng=$lng]/l">

<xsl:value-of select="@name"/><xsl:text>:[</xsl:text>
    <xsl:apply-templates select="$Vj/t[voko:max-prefix(.,$lng)=current()/@name]"/>
    <xsl:text>]
</xsl:text>
  </xsl:for-each>

-->

<xsl:text>
_______________________________
Ordigo per n-prefix - atendata rezulto:
gk: [gka,gka.ja,gcj.kaa]
c: [ca.ga,caua.kaa]
g: []
j: []
?: [kaa,ka.ja]
_______________________________
</xsl:text>

  <xsl:for-each select="$ord/lingvo[@lng='test-n']/l">

<xsl:value-of select="@name"/><xsl:text>:[</xsl:text>
    <xsl:apply-templates select="$Vj/t[voko:n-prefix(.,'test-n')=current()/@name]"/>
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