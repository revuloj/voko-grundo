<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="1.0">


<!-- (c) 2002-2013 che Wolfram Diestel

  transformi la stiloliston al HTML

-->

<xsl:param name="agordo-pado"/>

<xsl:variable name="enhavo"><xsl:value-of select="concat($agordo-pado,'/enhavo.xml')"/></xsl:variable>
 <xsl:variable name="inx_paghoj"
		select="count(document($enhavo)//pagho[not(@kashita='jes')])"/>


<xsl:template name="menuo-ktp">
  <xsl:variable name="aktiva" select="'_ktp.html'"/>
  <tr>
    <xsl:for-each select="document($enhavo)//pagho[not(@kashita='jes')]">
      <xsl:choose>
        <xsl:when test="@dosiero=$aktiva">
          <td class="aktiva">
            <a href="../inx/{@dosiero}">
              <xsl:value-of select="@titolo"/>
            </a>
          </td>
        </xsl:when>
        <xsl:otherwise>
          <td class="fona">
            <a href="../inx/{@dosiero}">
              <xsl:value-of select="@titolo"/>
            </a>
          </td>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:for-each>     
  </tr>
</xsl:template>


</xsl:stylesheet>
    





