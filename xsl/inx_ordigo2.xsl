<!DOCTYPE xsl:transform>

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:saxon="http://saxon.sf.net/"
  version="2.0"
  extension-element-prefixes="saxon" 
  xmlns:voko="http://reta-vortaro.de/"
>


<!-- (c) 2006-2021 ĉe Wolfram Diestel
     laŭ pemesilo GPL 2.0
-->

<xsl:param name="verbose" select="'false'"/>
<xsl:param name="debug" select="'false'"/>

<xsl:output method="xml" encoding="utf-8" indent="yes"/>
<xsl:strip-space elements="t t1 k"/>

<!-- saxon:collation name="unicode"
class="net.sf.saxon.sort.CodepointCollator"/ -->

<xsl:include href="inc/inx_ordigo2.inc"/>

<xsl:variable name="ordigo2">../cfg/ordigo2.xml</xsl:variable>
<xsl:variable name="ord" select="document($ordigo2)/ordigo"/>


<!-- funkcio por laŭsilaba ordigo. Ĝi trovas 
     la plej longan litergrupon egala al la vortkomenco -->
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

    <!-- kolektu ĉiujn litergrupojn kaj ordigu laŭ longeco
         prenu la plej longan kiel unuan elementon kaj rezulte redonu ĝin -->
    <xsl:variable name="literoj">
      <xsl:for-each select="$lng/l/g[starts-with($vorto,.)]">
        <xsl:sort select="string-length()" order="descending" data-type="number"/>
        <xsl:sequence select=".."/>
      </xsl:for-each>
    </xsl:variable>
    <!--xsl:message select="string-join($literoj/l/@name,',')"/-->
    <xsl:sequence select="$literoj/l[1]/@name"/> 

</xsl:function>



<xsl:template match="/">
  <indekso>
    <xsl:apply-templates/>
  </indekso>
</xsl:template>


<!-- ORDIGO DE TRD-OJ -->

<xsl:template match="trd-oj">

  <xsl:if test="$verbose='true'">
    <xsl:message>progreso: traktas lingvon "<xsl:value-of
         select="@lng"/>"...</xsl:message>
  </xsl:if>

  <!-- lau reguloj de kiu lingvo ordigi? -->
  <xsl:variable name="ordlng_1" 
     select="$ord/lingvo[string(@lng)=string(current()/@lng)]"/>     

  <!-- ni ordigas aŭ laŭ fikslonga prefikso aŭ la maksimume longa (t.e. silaba ordigo) -->
  <xsl:choose>
    <xsl:when test="$ordlng_1/@silab">

      <!-- 
          Laŭsilaba, t.e. maksimumlonge prefiksa ordigo (tibeta)....

          Alelektu al ĉiu litero la vortojn, por kiu voko:max-prefix() redonas ĝuste tiun 
      -->

      <xsl:if test="$debug='true'">
        <xsl:message>DBG: ordigi silabe, lingvo: "<xsl:value-of select="$ordlng_1/@lng"/>"...</xsl:message>
      </xsl:if>

      <xsl:variable name="trdoj" select="."/>

      <trd-oj lng="{@lng}" n="{@n}" p="{@p}">
        <xsl:for-each select="$ordlng_1/l">

            <xsl:call-template name="trd-litero">
              <!-- foriginte el la traduko la ignorendajn signojn
                    ni komparas la unuajn $n kun la difinitaj liter-grupoj el cfg/ordigo2.xml
                    krom se la vorto komenciĝas per la signovico donitaj en "minus".
                    Ekz-e la ĉaptiro "c" en la kimra ne enhavu la vortojn kun "ch en la komenco " -->
              <xsl:with-param name="trdoj" 
                select="$trdoj/v[voko:max-prefix(t,$ordlng_1/@lng)=current()/@name]"/>
              <xsl:with-param name="ordlng" select="$ordlng_1"/>
              <xsl:with-param name="lit-name" select="@name"/>
              <xsl:with-param name="lit-min" select="g[1]"/>
            </xsl:call-template>
        </xsl:for-each>
      </trd-oj>
    </xsl:when>

    <xsl:otherwise>

      <!-- 
          Ordinara laŭlitera, t.e. fikslonge prefiksa ordigo....

          Ĉu problemo: tio enkludas ankau <i>...</i> kiuj tiel ne aparas sub la ĵokero-litero "?" 
          aliflanke en taja lingvo tio estas ghuste uzata por ne havi vortojn komencighantajn
          per vokalo en du indeksoj -->

      <!-- xsl:variable name="ordlng" select="($ordlng_1|@lng)[1]"/ -->

      <xsl:variable name="ordlng">
        <xsl:choose>
          <xsl:when test="$ordlng_1/@kiel">
            <xsl:value-of select="$ordlng_1/@kiel"/>
          </xsl:when>
          <xsl:when test="$ordlng_1">
            <xsl:value-of select="@lng"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="'la'"/> <!-- se ne aperas en ordigo.xml, uzu latinajn regulojn -->
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
          
      <xsl:if test="$debug='true'">
        <xsl:message>DBG: ordigi lau lingvo: "<xsl:value-of select="$ordlng"/>"...</xsl:message>
      </xsl:if>

      <xsl:variable name="chiuj_literoj"
          select="translate(normalize-space($ord/lingvo[@lng=$ordlng]),' ','')"/>

      <xsl:variable name="ignorendaj" select="concat('-(',$ord/lingvo[@lng=$ordlng]/@ignorendaj)"/>


      <xsl:if test="$debug='true'">
        <xsl:message>DBG: literoj: "<xsl:value-of select="$chiuj_literoj"/>"...</xsl:message>
      </xsl:if>


      <xsl:if test="string-length($chiuj_literoj) > 0">
      
        <trd-oj lng="{@lng}" n="{@n}" p="{@p}">
          <xsl:variable name="trdoj" select="."/>

          <xsl:for-each select="$ord/lingvo[string(@lng)=$ordlng]/l">
            <!-- $n indikos kiom da signoj de la vortkomenco ni komparos por tiu
            litergrupo, tio estas aŭ donita en la difino de cfg/ordigo2.xml per @n
            aŭ 1, se @n mankas/estas malplena -->
            <xsl:variable name="n" select="number(substring(concat(@n,'1'),1,1))"/>

            <!-- la sekva solvas la problemon ekz. en la hispana kaj kimra, 
                kie ordighas "Ll" en alian grupon ol "L", sed vortoj komencighantaj je "Ll" 
                ne aperu ankau sub "L" -->

            <xsl:variable name="minus" select="../l[@name=current()/@minus]"/> 
            <!-- longeco ne de la litergrupo kies nomo egalas al @minus de la momenta litergrupo
              ni bezonas por kompari la ĝustan nombron la literoj -->
            <xsl:variable name="nminus"
              select="number(substring(concat(../l[@name=current()/@minus]/@n,'1'),1,1))"/>     

            <xsl:call-template name="trd-litero">
              <!-- foriginte el la traduko la ignorendajn signojn
                    ni komparas la unuajn $n kun la difinitaj liter-grupoj el cfg/ordigo2.xml
                    krom se la vorto komenciĝas per la signovico donitaj en "minus".
                    Ekz-e la ĉaptiro "c" en la kimra ne enhavu la vortojn kun "ch en la komenco " -->
              <xsl:with-param name="trdoj" 
                select="$trdoj/v[contains(current(),
                  substring(translate(t,$ignorendaj,''),1,$n)) 
                  and not(contains($minus,substring(t,1,$nminus)))]"/>
              <xsl:with-param name="ordlng" select="$ordlng"/>
              <xsl:with-param name="lit-name" select="@name"/>
              <xsl:with-param name="lit-min" select="substring(.,1,$n)"/>
            </xsl:call-template>

          </xsl:for-each>

          <!-- traktu chiujn erojn, kiuj ne komencighas 
              per iu litero el la ordigoreguloj, 
              (FIXME: problemo povus esti, ke ghi ne kaptus 
              ekz. en la bretona vortojn kiel "cabdefg", 
              char "c" jam aperas en la grupoj "ch" kaj "c'h") -->


            <xsl:call-template name="trd-litero">
              <xsl:with-param name="trdoj"
                  select="$trdoj/v[not(contains($chiuj_literoj,
                    substring(translate(t,$ignorendaj,''),1,1)))]"/>
              <xsl:with-param name="ordlng" select="$ordlng"/>
              <xsl:with-param name="lit-name" select="'0'"/>
              <xsl:with-param name="lit-min" select="'?'"/>
            </xsl:call-template>

        </trd-oj>
      </xsl:if>

    </xsl:otherwise>
  </xsl:choose>

</xsl:template>


<xsl:template match="mankoj">
  <xsl:copy-of select="."/>
</xsl:template>


<xsl:template match="kap-oj">
  <xsl:variable name="chiuj_literoj"
     select="translate(normalize-space($ord/lingvo[@lng='eo']),' ','')"/>
 
  <xsl:variable name="kapoj" select="."/>
 
  <xsl:if test="string-length($chiuj_literoj) > 0">
 
    <kap-oj lng="{@lng}">
      <xsl:apply-templates select="$kapoj/tez[v]"/>

      <xsl:for-each select="$ord/lingvo[@lng='eo']/l">

        <litero name="{@name}" min="{substring(.,1,1)}">
          <xsl:for-each 
             select="$kapoj/v[contains(current(),substring(translate(k,'-(',''),1,1))]">
 
            <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.EsperantoCollator" lang="eo" select="translate(k,'-( )','')"/>
            <xsl:call-template name="v"/>
          </xsl:for-each>
        </litero>

      </xsl:for-each>

      <!-- traktu chiujn erojn, kiuj ne komencighas 
           per iu litero el la ordigoreguloj -->

      <litero name="0" min="?">
        <xsl:for-each 
           select="$kapoj/v[not(contains($chiuj_literoj,substring(translate(k,'-(',''),1,1)))]">
 
          <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.EsperantoCollator" lang="eo" select="k"/>
          <xsl:call-template name="v"/>
        </xsl:for-each>
      </litero>
    </kap-oj>

  
    <!-- inversa indekso -->

    <inv lng="{@lng}">
      <xsl:for-each select="$ord/lingvo[@lng='eo']/l">

        <litero name="{@name}" min="{substring(.,1,1)}">
          <xsl:for-each select="$kapoj/v[r and
             contains(current(),substring(r,1,1))]">

            <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.EsperantoCollator" lang="eo" select="r"/> 
            <xsl:call-template name="v-inv"/>
          </xsl:for-each>
        </litero>

      </xsl:for-each>
    </inv>

  </xsl:if>
</xsl:template>


<xsl:template match="fako">
  <xsl:if test="$verbose='true'">
    <xsl:message>progreso: traktas fakon "<xsl:value-of
       select="@fak"/>"...</xsl:message>
  </xsl:if>

  <fako fak="{@fak}" n="{@n}">
    <xsl:apply-templates select="tez[v]"/>
    <xsl:for-each select="v">
      <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.EsperantoCollator" lang="eo"/>
      <xsl:call-template name="v-fak"/>
    </xsl:for-each>
  </fako>
</xsl:template>


<xsl:template match="bld-oj">
  <bld-oj>
    <xsl:for-each select="v">
      <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.EsperantoCollator" lang="eo" select="k"/>
      <xsl:call-template name="v"/>
    </xsl:for-each>
  </bld-oj>
</xsl:template>


<xsl:template match="mlg-oj">
  <mlg-oj>
    <xsl:for-each select="v">
      <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.EsperantoCollator" lang="eo" select="t"/>
      <xsl:call-template name="v"/>
    </xsl:for-each>
  </mlg-oj>
</xsl:template>


<xsl:template match="tez">
  <tez>
    <xsl:for-each select="v">
      <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.EsperantoCollator" lang="eo"/>
      <xsl:call-template name="v"/>
    </xsl:for-each>
  </tez>
</xsl:template>


<xsl:template match="stat|trd-snc">
  <xsl:copy-of select="."/>
</xsl:template>


<!-- xsl:template name="v">
  <v mrk="{@mrk}">
    <xsl:apply-templates select="k|t|t1"/>
  </v>
</xsl:template -->

<xsl:template name="v"><xsl:copy-of select="."/></xsl:template>


<!-- xsl:template name="v-fak">
  <v mrk="{@mrk}">
    <xsl:apply-templates/>
  </v>
</xsl:template -->

<xsl:template name="v-fak"><xsl:copy-of select="."/></xsl:template>


<xsl:template name="v-inv">
  <v mrk="{@mrk}">
    <k><xsl:apply-templates select="k1"/></k>
  </v>
</xsl:template>

<!-- xsl:template match="k|r|t1|u">
  <xsl:copy><xsl:apply-templates/></xsl:copy>
</xsl:template -->

<!--
  k: kapvorto
  r: radiko
  t1: traduko
  u: substrkeo (ind)
  s: transskribo
  t: indeksenda tradukvorto (el trd/ind/ts/baz)
-->
<xsl:template match="k|r|t1|u|s|t"><xsl:copy-of select="."/></xsl:template>

<!-- xsl:template match="t">
  <xsl:copy><xsl:value-of select="normalize-space(.)"/></xsl:copy>
</xsl:template --> 




</xsl:transform>






