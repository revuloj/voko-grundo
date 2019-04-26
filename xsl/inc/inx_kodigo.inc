<?xml version="1.0" encoding="UTF-8"?>
<!-- tiu chi dosiero estas automate farita el voko/cfg/ordigo2.xml -->
<!DOCTYPE xsl:transform>

<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:saxon="http://saxon.sf.net/"
  version="2.0"
  extension-element-prefixes="saxon">


<!-- (c) 2013 che Wolfram Diestel

  kodigo de esperanto-literoj ekz. en dosiernomoj

-->

<xsl:template name="eo-kodigo">
  <xsl:param name="str"/>

  <xsl:value-of select="
  replace(
    replace(
      replace(
        replace(
          replace(
            replace($str,'ĉ','cx'),
          'ĝ','gx'),
        'ĥ','hx'),
      'ĵ','jx'),
    'ŝ','sx'),
   'ŭ','ux')"/>
</xsl:template>

</xsl:transform>
