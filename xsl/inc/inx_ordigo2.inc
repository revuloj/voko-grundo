<?xml version="1.0" encoding="UTF-8"?>

<!-- (c) 2016 ĉe Wolfram Diestel

tiu chi dosiero estas ne plu automate farita el voko/cfg/ordigo2.xml -->

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:saxon="http://saxon.sf.net/"
  version="2.0"
  extension-element-prefixes="saxon">

<xsl:template name="trd-litero">
  <xsl:param name="trdoj"/>
  <xsl:param name="ordlng"/>
  <xsl:param name="lit-name"/>
  <xsl:param name="lit-min"/>

  <xsl:choose>

  <xsl:when test="$ordlng='br'">
      <litero name="{$lit-name}" min="{$lit-min}">
        <xsl:for-each select="$trdoj">
          <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.BretonCollator" 
		    lang="br" select="concat(t,'|',t1)"/>
          <xsl:call-template name="v"/>
        </xsl:for-each>
      </litero>        
    </xsl:when>

  <xsl:when test="$ordlng='ca'">
      <litero name="{$lit-name}" min="{$lit-min}">
        <xsl:for-each select="$trdoj">
          <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.CatalanCollator" 
		    lang="ca" select="concat(t,'|',t1)"/>
          <xsl:call-template name="v"/>
        </xsl:for-each>
      </litero>        
    </xsl:when>

  <xsl:when test="$ordlng='cy'">
      <litero name="{$lit-name}" min="{$lit-min}">
        <xsl:for-each select="$trdoj">
          <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.WelshCollator" 
		    lang="cy" select="concat(t,'|',t1)"/>
          <xsl:call-template name="v"/>
        </xsl:for-each>
      </litero>        
    </xsl:when>

  <xsl:when test="$ordlng='es'">
      <litero name="{$lit-name}" min="{$lit-min}">
        <xsl:for-each select="$trdoj">
          <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.SpanishCollator" 
		    lang="es" select="concat(t,'|',t1)"/>
          <xsl:call-template name="v"/>
        </xsl:for-each>
      </litero>        
    </xsl:when>

  <xsl:when test="$ordlng='fa'">
      <litero name="{$lit-name}" min="{$lit-min}">
        <xsl:for-each select="$trdoj">
          <xsl:sort collation="http://saxon.sf.net/collation?class=de.steloj.respiro.PersianCollator" 
		    lang="fa" select="concat(t,'|',t1)"/>
          <xsl:call-template name="v"/>
        </xsl:for-each>
      </litero>        
    </xsl:when>

    <xsl:otherwise>
      <litero name="{$lit-name}" min="{$lit-min}">
        <xsl:for-each select="$trdoj">
          <xsl:sort lang="{$ordlng}" select="concat(t,'|',t1)"/>
          <xsl:call-template name="v"/>
        </xsl:for-each>
      </litero>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

</xsl:transform>
