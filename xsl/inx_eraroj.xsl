<!DOCTYPE xsl:transform>

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:saxon="http://saxon.sf.net/"
  version="2.0"
  extension-element-prefixes="saxon" 
>


<!--xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:saxon="http://saxon.sf.net/"
  version="2.0"
  extension-element-prefixes="saxon" 
-->


<!-- (c) 2006 - 2021 ĉe Wolfram Diestel
     laŭ permesilo GPL 2.0

testu ekz-e:
    saxonb-xslt -xsl:xsl/inx_eraroj.xsl -s:/pado/revo/xml/{artikolo}.xml

-->


<xsl:output method="xml" encoding="utf-8" indent="no"/>
<xsl:param name="agordo-pado"/>

<xsl:variable name="file" select="document-uri(/)"/>
<xsl:variable name="filename" select="substring-before(tokenize($file,'/')[last()],'.xml')"/>
<xsl:variable name="base" select="string-join(tokenize($file,'/')[position() &lt; last()],'/')"/>

<!-- agordo-dosieroj kies enhavo estas uzata en la XSL-reguloj -->
<xsl:variable name="klasoj" select="concat($agordo-pado,'/klasoj.xml')"/>

<xsl:variable name="lingvoj">../cfg/lingvoj.xml</xsl:variable>
<xsl:variable name="fakoj">../cfg/fakoj.xml</xsl:variable>
<xsl:variable name="stiloj">../cfg/stiloj.xml</xsl:variable>

<xsl:template match="/">
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="art">
  <xsl:variable name="mrk" select="substring-after(substring-before(@mrk,'.xml'),'Id: ')"/>
  <xsl:variable name="dat" select="substring(substring-after(substring-after(@mrk,'.xml,v '),' '),1,19)"/>

  <art dos="{$filename}" dat="{$dat}">

  <xsl:choose>
    <!-- elemento <art> havu atributon @mrk -->
    <xsl:when test="$mrk='' or not($mrk)">
      <ero kie="art" mrk="{$mrk}" tip="art-sen-mrk"/>
    </xsl:when>
    <!-- la dosiernomo donita en atributo @mrk egalu al la efektiva dosiernomo -->
    <xsl:when test="$mrk != $filename">
      <ero  kie="art" mrk="{$mrk}" tip="mrk-ne-dos"/>
    </xsl:when>    
    <xsl:otherwise>
      <!-- la dosiernomo enhavu *neniujn* aliajn signojn krom minuskloj, ciferoj, substrekto -->
      <xsl:analyze-string select="$mrk" regex="[^a-z0-9_]">
        <xsl:matching-substring>
          <ero kie="art" mrk="{$mrk}" tip="art-mrk-sgn"/>
        </xsl:matching-substring>
      </xsl:analyze-string>
    </xsl:otherwise>
  </xsl:choose>

  <!-- ĉiu artikolo enhavu almenaŭ unu ekzemplon, ni estas iom malstriktaj farante escepton de tiu regulo
   por oficialaj arĥaikaj kaj raraj vortoj -->
  <xsl:if test="not(//ekz or //ofc or (//*[uzo[text()='ARK'] and uzo[text()='RAR']]))">
      <ero  kie="art" mrk="{$mrk}" tip="dos-sen-ekz"/>
  </xsl:if>

  <!-- se la radiko havas variaĵon, tiam ankaŭ unu derivaĵo havu variaĵon den la kap-elemento 
    Ni esceptas kelkajn artikolojn patriot...spiritual de tiu regulo
  -->
  <xsl:if test="kap/var and not(//drv/kap/var)  
    and not(kap/rad[.='patriot']) and not(kap/rad[.='ideal']) 
    and not(kap/rad[.='real']) and not(kap/rad[.='ego'])
    and not(kap/rad[.='spiritual'])">
                      <!-- atentu kelkajn esceptojn x/ism/o ~ xism/o -->
      <ero  kie="art" mrk="{$mrk}" tip="drv-sen-var"/>
  </xsl:if>

  <xsl:apply-templates/>
  </art>
</xsl:template>


<xsl:template match="drv|snc[@mrk]|subsnc[@mrk]|subart[@mrk]|ekz[@mrk]|rim[@mrk]">

  <xsl:variable name="mrk" select="@mrk"/>
  <xsl:variable name="kie" select="node-name(.)"/>

  <!-- la fina mrk-parto, post lasta punkto -->
  <xsl:variable name="mrk-fin" select="substring-after(@mrk,'.')"/>

  <!-- la unua parto de marko (antaŭ punkto, se estas) -->
  <xsl:variable name="mrk1">
    <xsl:choose>
      <xsl:when test="contains($mrk,'.')">
         <xsl:value-of select="substring-before($mrk,'.')"/>
      </xsl:when>
      <xsl:otherwise>
         <xsl:value-of select="$mrk"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- la dua parto de mrk (post unua punkto) -->
  <xsl:variable name="mrk2">
    <xsl:choose>
      <xsl:when test="contains($mrk-fin,'.')">
         <xsl:value-of select="substring-before($mrk-fin,'.')"/>
      </xsl:when>
      <xsl:otherwise>
         <xsl:value-of select="$mrk-fin"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:choose>
    <!-- ĉiu mrk-atributo (krom art@mrk) enhavu almenaŭ unu punkton -->
    <xsl:when test="not(contains($mrk,'.'))">
      <ero kie="{$kie}" mrk="{$mrk}" tip="mrk-prt"/>
    </xsl:when>
    <!-- ĉiu dua parto de mrk-elemento enhavu 0-signon (=tildo referenanta al la radiko),
      esceptoj estas rim@mrk, ekz@mrk -->
    <xsl:when test="not(contains($mrk2,'0')) and not(self::ekz|self::rim)">
      <ero kie="{$kie}" mrk="{$mrk}" tip="mrk-nul"/>
    </xsl:when>
    <!-- la unua parto de mrk-elemento ĉiam respondu al la dosieronomo -->
    <xsl:when test="$mrk1 != $filename">
      <ero kie="{$kie}" mrk="{$mrk}" tip="mrk-ne-dos"/>
    </xsl:when>
  </xsl:choose>

  <xsl:apply-templates/>
</xsl:template>


<xsl:template match="uzo">
  <xsl:variable name="mrk" select="ancestor::node()[@mrk][1]/@mrk"/>
  <xsl:variable name="kie" select="node-name(ancestor::node()[@mrk][1])"/>

  <xsl:choose>
    <!-- ĉiu fakindiko respondu al unu fako el la oficiala listo -->
    <xsl:when test="@tip='fak'">
      <xsl:if test="not(document($fakoj)//fako[@kodo=current()])">
        <ero kie="{$kie}" mrk="{$mrk}" tip="uzo-fak" arg="{.}"/>
      </xsl:if>
    </xsl:when>
    <!-- ĉiu stilindiko respondu al unu stilo el la oficiala listo -->
    <xsl:when test="@tip='stl'">
      <xsl:if test="not(document($stiloj)//stilo[@kodo=current()])">
        <ero kie="{$kie}" mrk="{$mrk}" tip="uzo-stl" arg="{.}"/>
      </xsl:if>
    </xsl:when>
  </xsl:choose>
</xsl:template>


<xsl:template match="trdgrp[@lng]|trd[@lng]">
  <!-- la @lng-atributo enhavu lingvokodon el la oficiala listo -->
  <xsl:if test="not(document($lingvoj)//lingvo[@kodo=current()/@lng])">
    <ero kie="{node-name(ancestor::node()[@mrk][1])}" 
         mrk="{ancestor::node()[@mrk][1]/@mrk}" tip="trd-lng" arg="{@lng}"/>
  </xsl:if>

  <!-- la tradukoj en sama nivelo estu ordigitaj laŭ lingvokodo -->
  <xsl:variable name="lng1" select="@lng"/>
  <xsl:if test="trdgrp[@lng&lt;=$lng1]|trd[@lng&lt;=$lng1]">
    <ero kie="{node-name(ancestor::node()[@mrk][1])}" 
         mrk="{ancestor::node()[@mrk][1]/@mrk}" tip="trd-ord" arg="{concat(@lng,':',.)}"/>
  </xsl:if>
</xsl:template>


<xsl:template match="ref">
  <xsl:variable name="mrk" select="ancestor::node()[@mrk][1]/@mrk"/>
  <xsl:variable name="kie" select="node-name(ancestor::node()[@mrk][1])"/>

  <!-- la celdosiero de ref-elemento -->
  <xsl:variable name="dosiero">
    <xsl:choose>
      <xsl:when test="contains(@cel,'.')">
        <xsl:value-of select="concat($base,'/',substring-before(@cel,'.'),'.xml')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat($base,'/',@cel,'.xml')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- la finparto de ref-celo -->
  <xsl:variable name="cel-fin" select="substring-after(@cel,'.')"/>
  <xsl:variable name="cel2">
    <xsl:choose>
      <xsl:when test="contains($cel-fin,'.')">
         <xsl:value-of select="substring-before($cel-fin,'.')"/>
      </xsl:when>
      <xsl:otherwise>
         <xsl:value-of select="$cel-fin"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:choose>
    <!-- ĉiu referenco havu celon -->
    <xsl:when test="not(@cel) or @cel=''">
      <ero kie="{$kie}" mrk="{$mrk}" tip="ref-sen-cel" arg="{.}"/>
    </xsl:when>
    <!-- la celdosiero ekzistu -->
    <xsl:when test="not(doc-available($dosiero))">
      <ero kie="{$kie}" mrk="{$mrk}" tip="ref-cel-dos" arg="{@cel}"/>
    </xsl:when>
    <!-- la dua parto de ref-celo enhavu signon '0' (cd. ĉe drv@mrk....) -->
    <xsl:when test="$cel2 != '' and not(contains($cel2,'0'))">
      <ero kie="{$kie}" mrk="{$mrk}" tip="ref-cel-nul" arg="{@cel}"/>
    </xsl:when>
    <!-- la ref-celo respondu al @mrk-atributo en la celosiero -->
    <xsl:when test="contains(@cel,'.') and not(document($dosiero)//node()[@mrk=current()/@cel])">
      <ero kie="{$kie}" mrk="{$mrk}" tip="ref-cel-mrk" arg="{@cel}"/>
    </xsl:when>
  </xsl:choose>

  <!-- ĉiu lst-referenco havu atributon @lst -->
  <xsl:if test="@tip='lst' and (not(@lst) or @lst='')">
    <ero kie="{$kie}" mrk="{$mrk}" tip="ref-tip-lst" arg="{@cel}"/>
  </xsl:if>

  <!-- la atributon @lst respondu al oficiala klaso -->
  <xsl:if test="@lst and not(document($klasoj)//kls[substring-after(@nom,'#')=current()/substring-after(@lst,':')])">
    <ero kie="{$kie}" mrk="{$mrk}" tip="ref-lst" arg="{@lst}"/>
  </xsl:if>
</xsl:template>


<xsl:template match="*">
  <xsl:apply-templates/>
</xsl:template>


<xsl:template match="text()"/>


</xsl:transform>










