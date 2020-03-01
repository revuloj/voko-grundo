<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="1.0">


<!-- (c) 2020 ĉe Wolfram Diestel laŭ permesilo GPL 2.0

tiuj ĉi transformreguloj estas uzataj por eltiri la markojn el indekso.xml
cele al kontrolado de unikeco kaj ne-pleneco...

-->

<xsl:param name="verbose" select="false"/>

<xsl:output method="text" encoding="utf-8"/>

<xsl:template match="/">
   <xsl:for-each select="//node()/@mrk|//node()/@mrk2">
    <xsl:text>mrk="</xsl:text><xsl:value-of select="."/><xsl:text>"
</xsl:text>    
   </xsl:for-each>
</xsl:template>   

</xsl:stylesheet>