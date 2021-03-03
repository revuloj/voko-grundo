##---------------------------------------------------------------------------##
##  File:
##      dtd.pl
##  Author:
##      Earl Hood			ehood@convex.com
##  Contributors:
##	Markus F.X.J. Oberhumer		markus.oberhumer@jk.uni-linz.ac.at
##	Steve Champeon			schampeo@aisg.com
##  Description:
##      This file defines the "dtd" perl package.
##---------------------------------------------------------------------------##
##  Copyright (C) 1994  Earl Hood, ehood@convex.com
##
##  This program is free software; you can redistribute it and/or modify
##  it under the terms of the GNU General Public License as published by
##  the Free Software Foundation; either version 2 of the License, or
##  (at your option) any later version.
## 
##  This program is distributed in the hope that it will be useful,
##  but WITHOUT ANY WARRANTY; without even the implied warranty of
##  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
##  GNU General Public License for more details.
##  
##  You should have received a copy of the GNU General Public License
##  along with this program; if not, write to the Free Software
##  Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
##---------------------------------------------------------------------------##
##
##	The following main routines are defined in dtd:
##
##	Routine Name		-- Brief Description
##  -------------------------------------------------------------------------
##	DTDget_base_children	-- Get base elements of an element
##	DTDget_elem_attr	-- Get attributes for an element
##	DTDget_elements		-- Get array of all elements
##	DTDget_exc_children	-- Get exclusion elements of an element
##	DTDget_gen_ents		-- Get general entities defined in DTD
##	DTDget_gen_data_ents	-- Get general entities: {PC,C,S}DATA, PI
##	DTDget_inc_children	-- Get inclusion elements of an element
##	DTDget_parents		-- Get parent elements of an element
##	DTDget_top_elements	-- Get top-most elements
##	DTDis_attr_keyword	-- Check for reserved attribute value
##	DTDis_elem_keyword	-- Check for reserved element value
##	DTDis_element		-- Check if element defined in DTD
##	DTDis_group_connector	-- Check for group connector
##	DTDis_occur_indicator	-- Check for occurrence indicator
##	DTDis_tag_name		-- Check for legal tag name.
##	DTDprint_tree		-- Output content tree for an element
##	DTDread_dtd		-- Parse a SGML dtd
##	DTDread_catalog_files	-- Parse a set of entity map files
##	DTDread_mapfile		-- Parse entity map file
##	DTDreset		-- Reset all internal data for DTD
##	DTDset_comment_callback -- Set SGML comment callback
##	DTDset_pi_callback	-- Set processing instruction callback
##	DTDset_verbosity 	-- Set verbosity flag
##  -------------------------------------------------------------------------
##	Note:  The above routines are defined to be part of package main.
##	       Therefore, one might have to qualify the routine if it
##	       is being called in another package besides main.
##
##
##	There exists other routines defined in package dtd that might
##	be useful besides the main ones defined.  See routines below
##	information.
##
##	See accompany documentation for further details on package "dtd".
##
##---------------------------------------------------------------------------##
##  Current status of package:
##
##	o <!DOCTYPE  is parsed, but external reference to file not
##	  implemented, yet.  
##
##	o Concurrent DTDs are not distinguished.
##
##	o <!ATTLIST #NOTATION is ignored.
##
##      o LINKTYPE, SHORTREF, USEMAP declarations are ignored.
##
##---------------------------------------------------------------------------##

package dtd;

$VERSION = "2.2.0";

##***************************************************************************##
##			       GLOBAL VARIABLES				     ##
##***************************************************************************##
##-------------------------##
## SGML key word variables ##
##-------------------------##
$ANY		= "ANY";
$ATTLIST	= "ATTLIST";
$CDATA		= "CDATA";
$COMMENT	= "--";
$CONREF		= "CONREF";
$CURRENT	= "CURRENT";
$DOCTYPE	= "DOCTYPE";
$ELEMENT	= "ELEMENT";
$EMPTY		= "EMPTY";
$ENDTAG		= "ENDTAG";
$ENTITY		= "ENTITY";
$ENTITIES	= "ENTITIES";
$FIXED		= "FIXED";
$ID		= "ID";
$IDREF		= "IDREF";
$IDREFS		= "IDREFS";
$IGNORE		= "IGNORE";
$IMPLIED	= "IMPLIED";
$INCLUDE	= "INCLUDE";
$LINK		= "LINK";
$LINKTYPE	= "LINKTYPE";
$MD		= "MD";
$MS		= "MS";
$NAME		= "NAME";
$NAMES		= "NAMES";
$NDATA		= "NDATA";
$NMTOKEN	= "NMTOKEN";
$NMTOKENS	= "NMTOKENS";
$NOTATION	= "NOTATION";
$NUMBER		= "NUMBER";
$NUMBERS	= "NUMBERS";
$NUTOKEN	= "NUTOKEN";
$NUTOKENS	= "NUTOKENS";
$PCDATA		= "PCDATA";
$PI		= "PI";
$PUBLIC		= "PUBLIC";
$RCDATA		= "RCDATA";
$REQUIRED	= "REQUIRED";
$SDATA		= "SDATA";
$SHORTREF	= "SHORTREF";
$SIMPLE		= "SIMPLE";
$STARTTAG	= "STARTTAG";
$SUBDOC		= "SUBDOC";
$SYSTEM		= "SYSTEM";
$TEMP		= "TEMP";
$TEXT		= "TEXT";
$USELINK	= "USELINK";
$USEMAP		= "USEMAP";

##------------------------------##
## SGML key character variables ##
##------------------------------##
## NOTE: Some variables have '\' characters because those variables are
##	 normally used in a Perl regular expression.  The variables 
##	 with the '_' appended to the end, are the non-escaped version
##	 of the variable.
##
## NOTE: If modifiy variables to support an alternative syntax, the
##	 first character of MDO and PIO must be the same.  The parsing
##	 routines require this.  Also, MDO and PIO are assumed to be
##	 2 characters in length.

$mdo	= '<!';		# Markup declaration open
$mdo_	= '<!';
$mdc	= '>';		# Markup declaration close
$mdc_	= '>';
$mdo1char = '<';	# This should also equal the first character in $pio
$mdo2char = '!';

$pio	= '<\?';	# Processing instruction open
$pio_	= '<?';
$pic	= '>';		# Processing instruction close
$pic_	= '>';
$pio1char = '<';
$pio2char = '?';

$stago	= '<';		# Start tag open
$stago_	= '<';
$etago	= '</';		# End tag open
$etago_	= '</';
$tagc	= '>';		# Tag close
$tagc_	= '>';

$mso	= '\['; 	# Marked section open
$mso_	= '[';
$msc	= '\]\]';	# Marked section close
$msc_	= ']]';

$rni	= '#';		# Reserved name indicator
$rni_	= '#';

$ero	= '&';		# General entity reference open
$ero_	= '&';
$pero	= '%';		# Parameter entity reference open
$pero_	= '%';
$cro	= '&#';		# Character reference open
$cro_	= '&#';
$refc	= ';';		# Reference close
$refc_	= ';';

$dso	= '\[';		# Doc type declaration subset open
$dso_	= '[';
$dsc	= '\]';		# Doc type declaration subset close
$dsc_	= ']';

## NOTE: It is not recommended to modify the comment delimiters.  The
##	 parsing routines require that the delimiters are 2 characters
##	 long, and the 2 characters are the same.

$como	= '--';		# Comment open
$como_	= '--';
$comc	= '--';		# Comment close (should be same as $como);
$comc_	= '--';
$comchar = '-';

$grpo	= '\(';		# Group open
$grpo_	= '(';
$grpc	= '\)';		# Group close
$grpc_	= ')';
$seq	= ',';		# Sequence connector
$seq_	= ',';
$and	= '&';		# And connector
$and_	= '&';
$or	= '\|';		# Or connector
$or_	= '|';
$opt	= '\?';		# Occurs zero or one time
$opt_	= '?';
$plus	= '\+';		# Occurs one or more times
$plus_	= '+';
$rep	= '\*';		# Occurs zero or more times
$rep_	= '*';
$inc	= '\+';		# Inclusion
$inc_	= '+';
$exc	= '-';		# Exclusion
$exc_	= '-';

$quotes	= q/'"/;	# Quote characters
$lit	= q/"/;
$lita	= q/'/;

##---------------------##
## SGML misc variables ##
##---------------------##
$namechars = '\w-\.';	# Regular expr repesenting characters in tag/entity
			# names.  Changing this can effect how attribute
			# values get stored (see do_attlist() routine).

%CharEntity = (		# Character entities
    'RE',	"\r",		# Record end
    'RS',	"\n",		# Record start
    'SPACE',	" ",		# Space
    'TAB',	"\t",		# Tab
    '34',	'"',		# Double quote
    '35',	'#',		# Number sign
    '37',	'%',		# Percent
    '39',	"'",		# Single quote
    '40',	'(',		# Left paren
    '41',	')',		# Right paren
    '42',	'*',		# Asterix
    '43',	'+',		# Plus
    '44',	',',		# Comma
    '45',	'-',		# Minus/hyphen
    '58',	':',		# Colon
    '59',	';',		# Semi-colon
    '61',	'=',		# Equal sign
    '64',	'@',		# At sign
    '91',	'[',		# Left square bracket
    '93',	']',		# Right square bracket
    '94',	'^',		# Carret
    '95',	'_',		# Underscore
    '123',	'{',		# Left curly brace
    '124',	'|',		# Vertical bar
    '125',	'}',		# Right curly brace
    '126',	'~',		# Tilde
);

##--------------------##
## Internal variables ##
##--------------------##
$keywords = "$CDATA|$CONREF|$CURRENT|$EMPTY|$ENTITY|$ENTITIES|$FIXED|".
	    "$ID|$IDREF|$IDREFS|$IMPLIED|$NAME|$NAMES|$NDATA|$NMTOKEN|".
	    "$NMTOKENS|$NOTATION|$NUMBER|$NUMBERS|$NUTOKEN|$NUTOKENS|$PCDATA|".
	    "$RCDATA|$REQUIRED|$SDATA";

$elem_keywords = "$rni$PCDATA|$RCDATA|$CDATA|$EMPTY|$ANY";
$attr_keywords = "$CDATA|$ENTITY|$ENTITIES|$ID|$IDREF|$IDREFS|$NAME|$NAMES|".
		 "$NMTOKEN|$NMTOKENS|$NOTATION|$NUMBER|$NUMBERS|$NUTOKEN|".
		 "$NUTOKENS|$rni$FIXED|$rni$REQUIRED|$rni$CURRENT|".
		 "$rni$IMPLIED|$rni$CONREF";

%_AGE	= ();	# Associative array containing all general entities THAT
		# may contain DTD markup.  I do not know if this is
		# really needed and legal, but IBMIdDoc seems to require
		# it.

$PI_CALLBACK = "";	   # Callback for processing instructions.
$COMMENT_CALLBACK = "";	   # Callback function for SGML comment declaration.
$VERBOSE = 0;		   # Printout what is going on.

##--------------##
## Function map ##
##--------------##
%Function = (
    $ATTLIST,	'do_attlist',
    $ELEMENT,	'do_element',
    $ENTITY,	'do_entity',
    $NOTATION,	'do_notation',
    $SHORTREF,	'do_shortref',
    $USEMAP,	'do_usemap',
);

##----------------------------##
## Entity maps: <!ENTITY ...> ##
##----------------------------##
%ParEntity	= ();	# Parameter entities
%PubParEntity	= ();	# External public parameter entities (PUBLIC)
%SysParEntity	= ();	# External system parameter entities (SYSTEM)
%GenEntity	= ();	# General entities
%StartTagEntity	= ();	# Start tag entities (STARTTAG)
%EndTagEntity	= ();	# End tag entities (ENDTAG)
%MSEntity	= ();	# Marked section entities (MS)
%MDEntity	= ();	# Markup declaration entities (MD)
%PIEntity	= ();	# Processing instruction entities (PI)
%CDataEntity	= ();	# Character data entities (CDATA)
%SDataEntity	= ();	# System data entities (SDATA)
%PubEntity	= ();	# External public entities (PUBLIC)
%SysEntity	= ();	# External system entities (SYSTEM)
%SysCDEntity	= ();	# Ext sys character data entities (SYSTEM CDATA)
%SysNDEntity	= ();	# Ext sys non-SGML data entities (SYSTEM NDATA)
%SysSDEntity	= ();	# Ext sys specific character entities (SYSTEM SDATA)
%SysSubDEntity	= ();	# Ext sys sub document entities (SYSTEM SUBDOC)

%ExtParmEnt2SysId = (); # Map of external parameter entities to filenames.
%ExtGenEnt2SysId = ();	# Map of general parameter entities to filenames.
%PubId2SysId	= ();	# Map of public identifiers  to filenames.

##--------------------------------##
## Notation maps: <!NOTATION ...> ##
##--------------------------------##
%SysNotation	= ();	# Valid notation names for SYSTEM entities
%PubNotation	= ();	# Valid notation names for PUBLIC entities

##---------------------------------##
## Short Ref maps: <!SHORTREF ...> ##
##---------------------------------##
%ShortRef	= ();	# Short ref mappings
%UseMap		= ();	# Element names associated to short ref (<!USEMAP ...>)

##------------------------------##
## Element maps: <!ELEMENT ...> ##
##------------------------------##
%ElemCont	= ();	# Base content of elements
%ElemInc	= ();	# Inclusion set
%ElemExc	= ();	# Exclusion set
%ElemTag	= ();	# Omitted tag minimization

##-----------------------------##
## Element map: <!ATTLIST ...> ##
##-----------------------------##
%Attribute	= ();	# Attributes for elements

##  %Attribute Description
##  ----------------------
##  The array is indexed by element names.  The value of each entry is the
##  name of an associative array which is indexed by the attribute names
##  for the element.  The associative array can be accessed via Perls eval 
##  operator.
##
##	Eg. Retrieve associative array of attributes for element 'para':
##
##		%attr = eval "%dtd'$dtd'Attribute{'para'}";
##
##	    You need the "dtd'" to qualify the variables since they were
##	    defined in package dtd (unless in package dtd).
##    
##  NOTE: The routine DTDget_elem_attr can be used to easily retrieve
##	  the associative array of attributes for an element.
##
##  The values of the attibute names' array contain a string of characters
##  separated by the $; variable.  Do a split on $; to get an array of all
##  possible values for an attribute name.
##
##	Eg. Retrieve possible values for 'para' attribute 'alignment':
##
##		@values = split(/$;/, $attr{'alignment'});
##
##  The first array value of the $; splitted array is the default value for
##  the attribute.  If the default value equals "#FIXED", then the next
##  array value is the #FIXED value.
##
##  The following array values are all posible values for the attribute;
##  which could be an SGML keyword.  I.e.  If an attribute value is declared
##  as an SGML keyword (eg. CDATA, NUTOKEN, etc), then there is only one
##  array item left (which is the SGML keyword).  The exception is an
##  attribute with a NOTATION value keyword.  In this case, there will be
##  more array items giving the possible values to the attribute.

##-----------------------------------------------------##
## Arrays for storing the order declarations processed ##
##-----------------------------------------------------##
@ParEntities	= ();	# Parameter entities in order processed
@GenEntities	= ();	# General entities in order processed
@Elements	= ();	# Elements in order processed

##-------------------------##
## Miscellaneous variables ##
##-------------------------##
$DocType	= '';	# Document type name (if applicable)

$extentcnt	= 0;	# Used to create unique filehandles 

##------------------------------------##
## Environment/Command-line Variables ##
##------------------------------------##
##	@P_SGML_PATH defines a list of paths for searching for external
##	entity references.  The user can define the environment
##	variable P_SGML_PATH to tell the dtd libaray which paths to
##	search.  The paths listed must be ':' (';' for MSDOS) separated.
##
##	Support for the SGML_SEARCH_PATH envariable had been added.
##	(11/08/95).
##
$pathsep = $ENV{'COMSPEC'} ? ';' : ':';
@P_SGML_PATH = ();
{
    local(@a) = (split(/$pathsep/o, $ENV{'P_SGML_PATH'}),
		 split(/$pathsep/o, $ENV{'SGML_SEARCH_PATH'}));
    @P_SGML_PATH = grep(/\S/, @a);	# Keep only non-whitespace components 
    push(@P_SGML_PATH, '.');
}

##***************************************************************************##
##			 DATA ACCESS/UTILITY ROUTINES			     ##
##***************************************************************************##
                            ##----------------##
                            ## Main Functions ##
                            ##----------------##
##---------------------------------------------------------------------------
##	DTDget_elements() retrieves all the elements defined in the DTD.
##	An optional flag argument can be passed to the routine to
##	determine is elements returned are sorted or not: 0 => sorted,
##	1 => not sorted.
##
sub main::DTDget_elements {
    local($nosort) = shift;
    $nosort ? @Elements : sort keys %ElemCont;
}
##---------------------------------------------------------------------------
##	DTDget_elem_attr() retrieves an associative array defining the
##	attributes associated with element $elem.
##
sub main::DTDget_elem_attr {
    local($elem) = shift @_;
    local(%attr);

    $elem =~ tr/A-Z/a-z/;
    %attr = eval "%$Attribute{$elem}" if $Attribute{$elem};
    %attr;
}
##---------------------------------------------------------------------------
##	DTDget_top_elements() retrieves the top-most elements in the DTD.
##
sub main::DTDget_top_elements {
    &compute_parents() unless defined(%Parents);
    return sort keys %TopElement;
}
##---------------------------------------------------------------------------
##	DTDis_attr_keyword() returns 1 if $word is an SGML reserved word
##	for an attribute value.
##
sub main::DTDis_attr_keyword {
    local($word) = shift;
    ($word =~ /^\s*($attr_keywords)\s*$/oi ? 1 : 0);
}
##---------------------------------------------------------------------------
##	DTDis_elem_keyword() returns 1 if $word is an SGML reserved word
##	used in an element content rule.
##
sub main::DTDis_elem_keyword {
    local($word) = shift;
    ($word =~ /^\s*($elem_keywords)\s*$/oi ? 1 : 0);
}
##---------------------------------------------------------------------------
##	DTDis_element() returns 1 if passed in string is an element
##	defined in the DTD.  Else it returns zero.
##
sub main::DTDis_element {
    local($elem) = shift;
    ($ElemCont{$elem} ? 1 : 0);
}
##---------------------------------------------------------------------------
sub main::DTDis_occur_indicator {
    local($str) = shift;
    ($str =~ /^\s*[$plus$opt$rep]\s*$/oi ? 1 : 0);
}
##---------------------------------------------------------------------------
sub main::DTDis_group_connector {
    local($str) = shift;
    ($str =~ /^\s*[$seq$and$or]\s*$/oi ? 1 : 0);
}
##---------------------------------------------------------------------------
##	DTDis_tag_name() returns 1 if $word is a legal tag name.
##
sub main::DTDis_tag_name {
    local($word) = shift;
    ($word =~ /^\s*[$namechars]+\s*$/oi ? 1 : 0);
}
##---------------------------------------------------------------------------
##	DTDget_parents() returns an array of elements that can be parent
##	elements of $elem.
##
sub main::DTDget_parents {
    local($elem) = shift;

    $elem =~ tr/A-Z/a-z/;
    &compute_parents() unless defined(%Parents);
    return sort split(' ', $Parents{$elem});
}
##---------------------------------------------------------------------------
##	DTDget_base_children() returns an array of the elements in
##	the base model group of $elem.
##
##	The $andcon is flag if the connector characters are included
##	in the array.
##
sub main::DTDget_base_children {
    local($elem, $andcon) = @_;
    return &extract_elem_names($ElemCont{$elem}, $andcon);
}
##---------------------------------------------------------------------------
##	DTDget_inc_children() returns an array of the elements in
##	the inclusion group of $elem content rule.
##
sub main::DTDget_inc_children {
    local($elem, $andcon) = @_;
    return &extract_elem_names($ElemInc{$elem}, $andcon);
}
##---------------------------------------------------------------------------
##	DTDget_exc_children() returns an array of the elements in
##	the exclusion group of $elem content rule.
##
sub main::DTDget_exc_children {
    local($elem, $andcon) = @_;
    return &extract_elem_names($ElemExc{$elem}, $andcon);
}
##---------------------------------------------------------------------------
##	DTDget_gen_ents() returns an array of general entities.
##	An optional flag argument can be passed to the routine to
##	determine is elements returned are sorted or not: 0 => sorted,
##	1 => not sorted.
##
sub main::DTDget_gen_ents {
    local($nosort) = shift;
    return ($nosort ? @GenEntities : sort @GenEntities);
}
##---------------------------------------------------------------------------
##	DTDget_gen_data_ents() returns an array of general data
##	entities defined in the DTD.  Data entities cover the
##	following: PCDATA, CDATA, SDATA, PI.
##
sub main::DTDget_gen_data_ents {
    sort keys %GenEntity,		# PCDATA
	 keys %PIEntity,		# PI
	 keys %CDataEntity,		# CDATA
	 keys %SDataEntity;		# SDATA
}
##---------------------------------------------------------------------------
sub main::DTDreset {
    %ParEntity 		= ();
    %PubParEntity 	= ();
    %SysParEntity 	= ();
    %GenEntity 		= ();
    %StartTagEntity 	= ();
    %EndTagEntity 	= ();
    %MSEntity 		= ();
    %MDEntity 		= ();
    %PIEntity 		= ();
    %CDataEntity 	= ();
    %SDataEntity 	= ();
    %PubEntity 		= ();
    %SysEntity 		= ();
    %SysCDEntity 	= ();
    %SysNDEntity 	= ();
    %SysSDEntity 	= ();
    %SysSubDEntity 	= ();
    %SysNotation 	= ();
    %PubNotation 	= ();
    %ShortRef 		= ();
    %UseMap 		= ();
    %ElemCont 		= ();
    %ElemInc 		= ();
    %ElemExc 		= ();
    %ElemTag		= ();
    %Attribute		= ();

    @ParEntities    	= ();
    @GenEntities    	= ();
    @Elements       	= ();

    %Parents 		= ();
    %TopElement 	= ();

    %_AGE 		= ();

    $COMMENT_CALLBACK	= "";
    $PI_CALLBACK	= "";
}
##---------------------------------------------------------------------------
                            ##---------------##
                            ## DTD Functions ##
                            ##---------------##
##---------------------------------------------------------------------------
##	compute_parents() generates the %Parents and %TopElement arrays.
##
sub compute_parents {
    local($elem, %exc);

    foreach $elem (&::DTDget_elements()) {
        foreach (&extract_elem_names($ElemExc{$elem})) { $exc{$_} = 1; }
	foreach (&extract_elem_names($ElemCont{$elem})) {
	    $Parents{$_} .= ($Parents{$_} ? ' ' : '') . $elem
		unless $exc{$_} || !&'DTDis_element($_);
	}
        foreach (&extract_elem_names($ElemInc{$elem})) {
            $Parents{$_} .= ($Parents{$_} ? ' ' : '') . $elem
                unless $exc{$_} || !&::DTDis_element($_);
        }
        %exc = ();
    }
    foreach (keys %ElemCont) {
	$TopElement{$_} = 1 if !$Parents{$_} || $Parents{$_} eq $_;
    }
}
##---------------------------------------------------------------------------

##***************************************************************************##
##				PARSE ROUTINES				     ##
##***************************************************************************##
##---------------------------------------------------------------------------
##  Notes:
##	The parsing routines have a specific calling sequence.  Many
##	of the routines rely on other routines updating the current
##	parsed line.  Many of them pass the current line by reference.
##
##	See individual routine declaration for more information.
##---------------------------------------------------------------------------

$IncMS	= 1;
$IgnMS	= 2;
                            ##----------------##
                            ## Main Functions ##
                            ##----------------##
##---------------------------------------------------------------------------
##	DTDread_dtd() parses the contents of an open file specified by
##	$handle.
##
sub main::DTDread_dtd {
    local($handle, $include) = @_;
    local($line, $c);
    local($oldslash) = $/;
    local($old) = select($handle);

    $include = $IncMS unless $include;
    return if $include == $IgnMS;		# Do nothing if ignoring
    while (!eof($handle)) {
        $/ = $mdo1char;
        $line = <$handle>;              	# Read until first declaration
        &find_ext_parm_ref(*line, $include)	# Read any external files
	    if $include == $IncMS;
        last if eof($handle);           	# Exit if EOF
	$c = getc($handle);
	if ($c eq $mdo2char) {
	    &read_declaration($handle, $include);	# Read declaration
	} elsif ($c eq $pio2char) {
	    &read_procinst($handle, $include);		# Read processing inst.
	} else {
	    die "Unrecognized markup: $line$c\n";
	}
    }
    select($old);				# Reset default filehandle
    $/ = $oldslash;				# Reset $/
}
##---------------------------------------------------------------------------
##	DTDread_catalog_files() reads all catalog entry files (aka map
##	files) specified by @files and by the SGML_CATALOG_FILES
##	envariable.
##
sub main::DTDread_catalog_files {
    local(@files) = @_;

    foreach (@files) { &::DTDread_mapfile($_); }
    foreach (split(/$pathsep/o, $ENV{'SGML_CATALOG_FILES'})) {
	&'DTDread_mapfile($_);
    }
}
##---------------------------------------------------------------------------
##	DTDread_mapfile() opens and parse the entity map file specified
##	by $filename.
##
sub main::DTDread_mapfile {
    local($filename) = @_;
    local($id, $file, $tmp);
    $tmp = 0;

    ## Open file
    if ($filename =~ /^\// || $filename =~ /^\w:\\/) {	# Absolute pathname
	if (open(MAPFILE, "$_/$filename")) { $tmp = 1; }
    } else {						# Search for file
	foreach (@P_SGML_PATH) {
	    if (open(MAPFILE, "$_/$filename")) { $tmp = 1; last; }
	}
    }
    warn "Unable to open entity map file: $filename\n", return
	unless $tmp;

    while (<MAPFILE>) {
	next if /^\s*$/ || /^\s*$como/o;	# Skip blank/comment lines
	chop;

	## Break up line into 3 components
	s/^\s*(\S+)\s+//;  $type = $1;	# Get type of entry
	s/\s+(\S+)\s*$//;  $sysid = $1;	# Get system id
	    $sysid =~ s/^['"]//;  $sysid =~ s/["']$//;
	$id = $_;			# Now should have id left
	    $id =~ s/^['"]//;  $id =~ s/["']$//;
	&zip_wspace(*id);		# Remove extra space

	## Store mappings
	if ($type =~ /public/i) {	# Public Id -> System Id
	    $PubId2SysId{$id} = $sysid
		unless defined($PubId2SysId{$id});

	} elsif ($type =~ /entity/i) {	# Entity -> System Id
	    if ($id =~ /%/) {			# Parameter entity
		$id =~ s/%//;
		$ExtParmEnt2SysId{$id} = $sysid
		    unless defined($ExtParmEnt2SysId{$id});
	    } else {				# General entity
		$ExtGenEnt2SysId{$id} = $sysid
		    unless defined($ExtGenEnt2SysId{$id});
	    }
	}
    }
    close(MAPFILE);
}
##---------------------------------------------------------------------------
##	DTDset_comment_callback() sets the function to be called when an
##	SGML comment declaration is encountered.
##
##	Note: the function is called within the context of package dtd.
##	      Therefore, one might have to prefix the function name
##	      with the package name it is defined in.
##
sub main::DTDset_comment_callback {
    $COMMENT_CALLBACK = shift;
}
##---------------------------------------------------------------------------
##	DTDset_verbosity() sets the verbosity flag.  Setting it to a
##	non-zero value cause DTDread_dtd() to output status messages
##	as it parses a DTD.
##
sub main::DTDset_verbosity {
    $VERBOSE = shift;
}
##---------------------------------------------------------------------------
##	DTDset_pi_callback() sets the function to be called when a
##	processing instruction is encountered.
##
##	Note: the function is called within the context of package dtd.
##	      Therefore, one might have to prefix the function name
##	      with the package name it is defined in.
##
sub main::DTDset_pi_callback {
    $PI_CALLBACK = shift;
}
##---------------------------------------------------------------------------
                            ##---------------##
                            ## DTD Functions ##
                            ##---------------##
##---------------------------------------------------------------------------
##	read_declaration() parses a declaration.  $include determines
##	if the declaration is to be included or ignored.
##
sub read_declaration {
    local($handle, $include) = @_;
    local($d) = $/;
    local($c, $line, $func, $tmp, $i, $q);
    $line = '';

    $c = getc($handle);
    &read_comment($handle), return		# Comment declaration
	if $c eq $comchar;
    &read_msection($handle, $include), return	# Marked section
	if $c eq $mso_;

    $func = $c;
    while ($c !~ /^\s*$/) {     # Get declaration type
        $c = getc($handle);
        $func .= $c;
    }
    chop $func;
    $func =~ tr/a-z/A-Z/;	# Translate declaration type to uppercase
    &read_doctype($handle, $include), return	# DOCTYPE declaration
	if $func =~ /^\s*$DOCTYPE\s*$/oi;
    &read_linktype($handle, $include), return	# LINKTYPE declaration
	if $func =~ /^\s*$LINKTYPE\s*$/oi;

    while ($c ne $mdc) {		# Get rest of declaration
        $c = getc($handle);		    # Get next character
        if ($c eq $comchar) {		    # Check for comment
            $i = getc($handle);			# Get next character
            if ($i eq $comchar) { 	 	# Remove in-line comments
                $/ = $comc_;  $tmp = <$handle>; # Slurp comment
            } elsif ($i =~ /[$quotes]/o) {	# Check for quoted string
		$/ = $i;  $tmp = <$handle>;	# Slurp string
		$line .= $c . $i . $tmp;
	    } else {				# Save characters
		$line .= $c . $i;
		$c = $i;			# Set $c for while condition
	    }
        } elsif ($c =~ /[$quotes]/o) {	    # Check for quoted string
	    $/ = $c;  $tmp = <$handle>;
	    $line .= $c . $tmp;
	} else {			    # Save character
	    $line .= $c;
	}
    }
    if ($include == $IncMS) {		# Process declaration if including
	chop $line;			    # Remove close delimiter
	$line =~ s/\n/ /g;		    # Translate newlines to spaces
	$tmp = $Function{$func};
	&$tmp(*line) if $tmp;		    # Interpret declaration
    }
    $/ = $d;				# Reset slurp var
}
##---------------------------------------------------------------------------
##	read_procinst() reads in a processing instruction.
##
sub read_procinst {
    local($handle, $include) = @_;
    local($d) = $/;
    local($txt, $i);

    $/ = $pic_;			# Set slurp var to '>'
    $txt = <$handle>;		# Get pi text
    print STDERR "Processing instruction: $id\n" if $VERBOSE;
    if ($include == $IncMS) {
	if ($PI_CALLBACK) {	# Call pi callback if defined.
	    print STDERR "\tInvoking $PI_CALLBACK\n" if $VERBOSE;

	    for ($i=0; $i < length($/); $i++) {
		chop $txt; }		# Remove close delimiter
	    &$PI_CALLBACK(*txt);
	}
    }
    $/ = $d;			# Reset slurp var
}
##---------------------------------------------------------------------------
##	read_comment() slurps up a comment declaration.
##
sub read_comment {
    local($handle) = @_;
    local($d) = $/;
    local($txt, $i, $tmp);
    $txt = '';

    print STDERR "Comment declaration\n" if $VERBOSE;
    getc($handle);		# Read second comment character
    while (1) {			# Get comment text
	$/ = $mdc_;		    		# Set slurp var to ">"
	$tmp = <$handle>;
	$txt .= $tmp;
	last if $tmp =~ /$comc\s*$mdc$/o;	# Check for close
    }
    if ($COMMENT_CALLBACK) {	# Call comment callback if defined.
	print STDERR "\tInvoking $COMMENT_CALLBACK\n" if $VERBOSE;

	$txt =~ s/^([\S\s]*)$comc\s*$mdc$/$1/o;	# Remove comment close
	$txt = ' ' x length($mdo_ . $como_) . $txt;
	&$COMMENT_CALLBACK(*txt);
    }
    $/ = $d;			# Reset slurp var
}
##---------------------------------------------------------------------------
##	read_doctype() parses a DOCTYPE declaration.  $include determines
##	if the declaration is to be included or ignored.
##
sub read_doctype {
    local($handle, $include) = @_;
    local($line, $dt);
    local($d) = $/;

    ##	Should be processing one DOCTYPE at most.
    if ($DocType && $include) {
	die "A second DOCTYPE declaration exists\n";
    }

    $/ = $dso_;
    $line = <$handle>;                  # Get text before $dso
    print STDERR "$DOCTYPE $line\n" if $VERBOSE;
    if ($include) {
	$dt = &get_next_group(*line);	# Get doctype name
	($DocType = $dt) =~ tr/a-z/A-Z/;
    }
    &read_subset($handle, $include, $dsc_.$mdc_);
    print STDERR "Finished $DOCTYPE\n" if $VERBOSE;
    $/ = $d;				# Reset slurp var
}
##---------------------------------------------------------------------------
##	read_linktype() parses a LINKTYPE declaration.  $include determines
##	if the declaration is to be included or ignored.
##
sub read_linktype {
    local($handle, $include) = @_;
    local($line);
    local($d) = $/;

    $/ = $dso_;
    $line = <$handle>;                  # Get text before $dso
    &expand_entities(*line);
    warn "$LINKTYPE declaration ignored\n";
    &read_subset($handle, $IgnMS, $dsc_.$mdc_);
    $/ = $d;				# Reset slurp var
}
##---------------------------------------------------------------------------
##	read_msection() parses marked section.  $include determines
##	if the section is to be included or ignored.
##
sub read_msection {
    local($handle, $include) = @_;
    local($line);
    local($d) = $/;

    $/ = $dso_;
    $line = <$handle>;                  # Get status keyword
    &expand_entities(*line);
    print STDERR "Begin Marked Section: $line\n" if $VERBOSE;

    if ($line =~ /$RCDATA/io || $line =~ /$CDATA/io) {	# Ignore (R)CDATA
	&slurp_msection($handle);
    } elsif ($line =~ /$IGNORE/io) {			# Check for IGNORE
	$include = $IgnMS;
	&read_subset($handle, $include, $msc_.$mdc_);
    } else {
	&read_subset($handle, $include, $msc_.$mdc_);
    }

    print STDERR "End Marked Section\n" if $VERBOSE;
    $/ = $d;				# Reset slurp var
}
##---------------------------------------------------------------------------
##	slurp_msection() skips past a marked section that cannot include
##	nested marked sections.  This routine is used when RCDATA or
##	CDATA marked sections are encountered.
##
sub slurp_msection {
    local($handle) = @_;
    local($d) = $/;
    $/ = $msc_;  <$handle>;
    $/ = $mdc_;  <$handle>;
    $/ = $d;				# Reset slurp var
}
##---------------------------------------------------------------------------
##	read_subset() parses a subset section.  $include determines
##	if the subset is included or ignored.  $endseq signifies the
##	end delimiting sequence of the subset.
##
sub read_subset {
    local($handle, $include, $endseq) = @_;
    local($c, $i, $line);
    local(@chars) = split(//, $endseq);

    print STDERR "Begin Subset\n" if $VERBOSE;
    while (1) {
        $c = getc($handle);  next if $c =~ /^\s$/;
        if ($c eq $mdo1char) {     	# declaration statement
            $c = getc($handle);
	    if ($c eq $mdo2char) {
		&read_declaration($handle, $include);	# Read declaration
	    } elsif ($c eq $pio2char) {
		&read_procinst($handle, $include);	# Read processing inst.
	    } else {
		&subset_error($c, "Invalid second character for MDO or PIO");
	    }
        }
        elsif ($c eq $chars[0]) {		# End of subset section
	    for ($i=1; $i <= $#chars; ) {
		$c = getc($handle);
		if ($c eq $chars[$i]) { $i++; }		# Part of $endseq
		elsif ($c =~ /^\s$/) { next; }		# Whitespace
		else { last; }
	    }
	    if ($i > $#chars) {
		print STDERR "End Subset\n" if $VERBOSE;
		return;
	    }
        }
        elsif ($c eq $pero) {			# Ext parm entity ref
            $line = $c;
            while (1) {
                $c = getc($handle);
                if ($c =~ /[$namechars]/o) { $line .= $c; }
                else { last; }
            }
            &find_ext_parm_ref(*line, $include) if $include == $IncMS;
        }
        else {
	    &subset_error($c,
		"Invalid character found outside of a markup statment");
        }
    }
}
##---------------------------------------------------------------------------
##	find_ext_parm_ref() evaulates in external parameter entity
##	references in *line.  $include is the INCLUDE/IGNORE flag
##	that is passed to DTDread_dtd.
##
sub find_ext_parm_ref {
    local(*line, $include) = @_;
    local($i, $tmp);
    while ($line =~ /$pero/o) {
        $line =~ s/$pero([$namechars]+)$refc?//o;
        if (($i = &resolve_ext_entity_ref($1)) &&
            ($tmp = &open_ext_entity($i))) {
                &'DTDread_dtd($tmp, $include);
                close($tmp);
        }
    }
}
##---------------------------------------------------------------------------
##	subset_error() prints out a terse error message and dies.  This
##	routine is called if there is a syntax error in a subset section.
##
##	Print of character inside quotes, followed by the ASCII code for
##	easy identification, suggested by schampeo@aisg.com (06/01/94).
##
sub subset_error {
    local($c, $hint) = @_;
    die "Syntax error in subset.\n",
        qq|\tUnexpected character: "$c", ascii code=|, ord($c), ".\n",
	($hint ? "    Reason:\n\t$hint\n" : "\n");
}
##---------------------------------------------------------------------------
sub do_attlist {
    local(*line) = @_;
    local($tmp, $attname, $attvals, $attdef, $fixval, %attr,
	  @array, $notation);

    &expand_entities(*line);
    $tmp = &get_next_group(*line);	 	# Get element name(s)
    if ($tmp =~ /^\s*$rni$NOTATION\s*$/io) {	# Check for #NOTATION
	warn "$ATTLIST $rni$NOTATION skipped\n";
	return;
    }
    print STDERR "$ATTLIST: $tmp\n" if $VERBOSE;
    $tmp =~ s/($grpo|$grpc|\s+)//go;
    $tmp =~ tr/A-Z/a-z/;		 # Convert all names to lowercase
    @names = split(/[$or$and$seq\s]+/o, $tmp);
    while ($line !~ /^\s*$/) {
	$attname = &get_next_group(*line);
	$attname =~ tr/A-Z/a-z/;	 # Convert attribute name to lowercase
	$attvals = &get_next_group(*line);
	if ($attvals =~ /^\s*$NOTATION\s*$/io) {	# Check for NOTATION
	    $notation = 1;
	    $attvals = &get_next_group(*line);
	} else {
	    $notation = 0;
	}
	$attdef  = &get_next_group(*line);
	if ($attdef =~ /^\s*$rni$FIXED\s*$/io) {	# Check for #FIXED
	    $fixval = &get_next_group(*line);
	} else {
	    $fixval = "";
	}
	$attvals =~ s/[$grpo$grpc\s]//go;
	@array = split(/[$seq$and$or]/o, $attvals);
	unshift(@array, $NOTATION) if $notation;
	if ($fixval) {
	    $attr{$attname} = join($;, $attdef, $fixval, @array);
	} else {
	    $attr{$attname} = join($;, $attdef, @array);
	}
    }
    foreach (@names) {
	$tmp = $_;			# Store original name
	s/-/X/g;			# Protect from creating illegal
	s/\./Y/g;			#   perl variable name.  These
					#   expressions need to be changed
					#   or added to if $namechars is
					#   changed.

	eval "%${_}_attr = %attr";	# Create assoc array for values
	$Attribute{$tmp} = "${_}_attr"; # Store name of assoc
    }
}
##---------------------------------------------------------------------------
sub do_element {
    local(*line) = @_;
    local($tmp, @names, $tagm, $elcont, $elinc, $elexc);
    $elinc = '';  $elexc = '';

    &expand_entities(*line);
    $tmp = &get_next_group(*line);	 # Get element name(s)
    print STDERR "$ELEMENT: $tmp\n" if $VERBOSE;
    $tmp =~ s/[$grpo$grpc\s]//go;
    $tmp =~ tr/A-Z/a-z/;		 # Convert all names to lowercase
    @names = split(/[$or$and$seq\s]+/o, $tmp);

    if ($line =~ s/^([-Oo]{1})\s+([-Oo]{1})\s+//) { # Get tag minimization
	($tagm = "$1 $2") =~ tr/o/O/;
    } else {
	$tagm = "- -";
    }
 
    $elcont = &get_next_group(*line);	 # Get content

    if ($elcont ne $EMPTY) {		 # Get inclusion/exclusion groups
	$elcont =~ tr/A-Z/a-z/;
	while ($line !~ /^\s*$/) {
	    if ($line =~ /^$inc/o) { $elinc = &get_inc(*line); }
	    elsif ($line =~ /^$exc/o) { $elexc = &get_exc(*line); }
	    else { last; }
	}
	$elinc =~ tr/A-Z/a-z/;
	$elexc =~ tr/A-Z/a-z/;
    }

    foreach (@names) {			# Store element information
	if (defined($ElemCont{$_})) {
	    warn "Duplicate element declaration: $_\n"; }
	else {
	    $ElemCont{$_} = $elcont;
	    $ElemInc{$_} = $elinc;
	    $ElemExc{$_} = $elexc;
	    $ElemTag{$_} = $tagm;
	    push(@Elements, $_);
	}
    }
}
##---------------------------------------------------------------------------
sub do_entity {
    local(*line) = @_;

    if ($line =~ /^\s*$pero/o) { &do_parm_entity(*line); }
    else { &do_gen_entity(*line); }
}
##---------------------------------------------------------------------------
sub do_notation {
    local(*line) = @_;
    local($name);

    $name = &get_next_group(*line);
    print STDERR "$NOTATION $name\n" if $VERBOSE;

    if ($line =~ s/^$SYSTEM\s+//io) {		# SYSTEM notation
	$SysNotation{$name} = &get_next_group(*line)
	    unless defined($SysNotation{$name});
    } else {				  	# PUBLIC notation
	$line =~ s/^$PUBLIC\s+//io;
	$PubNotation{$name} = &get_next_group(*line)
	    unless defined($PubNotation{$name});
    }
}
##---------------------------------------------------------------------------
sub do_shortref {
    local(*line) = @_;
    warn "$SHORTREF declaration ignored\n";
}
##---------------------------------------------------------------------------
sub do_usemap {
    local(*line) = @_;
    warn "$USEMAP declaration ignored\n";
}
##---------------------------------------------------------------------------
##      del_comments() removes any inline comments from *line.
##      Unfortuneatly, this routines needs knowledge of the comment
##      delimiters.  If the deliminters are changed, this routine
##      must be updated.
##
sub del_comments {
    local(*line) = @_;
    $line =~ s/$como([^-]|-[^-])*$comc//go;
}
##---------------------------------------------------------------------------
##	expand_entities() expands all entity references in *line.
##
sub expand_entities {
    local(*line) = @_;

    while ($line =~ /($pero|$ero|$cro)[$namechars]+$refc?/o) {
	&expand_parm_entities(*line);
	&expand_gen_entities(*line);
	&expand_char_entities(*line);
    };
}
##---------------------------------------------------------------------------
##	expand_parm_entities() expands all parameter entity references
##	in *line.
##
sub expand_parm_entities {
    local(*line) = @_;

    while ($line =~ s/$pero([$namechars]+)$refc?/$ParEntity{$1}/) {
	warn qq|Parameter entity "$1" not defined.  |,
	     qq|May cause parsing errors.\n|
	    unless defined($ParEntity{$1});
	&del_comments(*line);
    }
}
##---------------------------------------------------------------------------
##	expand_gen_entities() expands all general entity references
##	in *line.
##
sub expand_gen_entities {
    local(*line) = @_;

    while ($line =~ s/$ero([$namechars]+)$refc?/$_AGE{$1}/) {
	warn qq|Entity "$1" not defined.  May cause parsing errors.\n|
	    unless defined($_AGE{$1});
	&del_comments(*line);
    }
}
##---------------------------------------------------------------------------
##	expand_char_entities() expands all character entity references
##	in *line.
##
sub expand_char_entities {
    local(*line) = @_;

    while ($line =~ s/$cro([$namechars]+)$refc?/$CharEntity{$1}/) {
	warn qq|Character entity "$1" not recognized.  |,
	     qq|May cause parsing errors.\n|
	    unless defined($CharEntity{$1});
    }
}
##---------------------------------------------------------------------------
##	extract_elem_names() extracts just the element names of $str.
##	An array is returned.  The elements in $str are assumed to be
##	separated by connectors.
##
##	The $andcon is flag if the connector characters are included
##	in the array.
##
sub extract_elem_names {
    local($str, $andcon) = @_;
    local(@ret_a);
    if ($andcon) {
	local($exchar) = ('');
	$str =~ s/\s//go;
	if ($str =~ s/^([$inc$exc])//o)	# Check for exception rules
	    { $exchar = $1; }
	@ret_a = ($exchar,
	          split(/([$seq$and$or$grpo$grpc$opt$plus$rep])/o, $str));
    }
    else {
	$str =~ s/^\s*[$inc$exc]//;	# Check for exception rules
	$str =~ s/[$grpo$grpc$opt$plus$rep\s]//go;
	@ret_a = (split(/[$seq$and$or]/o, $str));
    }
    grep($_ ne '', @ret_a);		# Strip out null items
}
##---------------------------------------------------------------------------
##	open_ext_entity() opens the external entity file $filename.
##
sub open_ext_entity {
    local($filename) = @_;
    local($ret);
    local($fname) = ('EXTENT' . $extentcnt++);

    foreach (@P_SGML_PATH) {
	if (open($fname, "$_/$filename")) {
	    print STDERR "Opening $_/$filename for reading\n" if $VERBOSE;
	    $ret = $fname;
	    last;
	}
    }
    warn "Unable to open $filename\n" unless $ret;
    $ret;
}
##---------------------------------------------------------------------------
##	resolve_ext_entity_ref() translates an external entity to
##	its corresponding filename.  The entity identifier is checked
##	first.  If that fails, then the entity name
##	itself is used for resolution.
##
sub resolve_ext_entity_ref {
    local($ent) = @_;
    local($aa);

    EREFSW: {
	last EREFSW if ($aa = $PubParEntity{$ent});
	last EREFSW if ($aa = $SysParEntity{$ent});
	last EREFSW if ($aa = $PubEntity{$ent});
	last EREFSW if ($aa = $SysEntity{$ent});
	last EREFSW if ($aa = $SysCDEntity{$ent});
	last EREFSW if ($aa = $SysNDEntity{$ent});
	last EREFSW if ($aa = $SysSDEntity{$ent});
	last EREFSW if ($aa = $SysSubDEntity{$ent});
	warn "Entity referenced, but not defined: $ent\n", return "";
    }
    &entity_to_sys($ent, $aa);
}
##---------------------------------------------------------------------------
##	entity_to_sys() maps an external entity to a system identifier.
##	How the map is resolved:
##		1.  Return pub->sys id map for $id, or
##		2.  Return external parameter entity map for $ent, or
##		3.  Return external general entity map for $ent, or
##		4.  Return $id, or
##		5.  Return $ent
##	2 and 3 should not conflict since parameter entity names should
##	not conflict with general entity names.
##
sub entity_to_sys {
    local($ent, $id) = @_;

    $PubId2SysId{$id} ||
    $ExtParmEnt2SysId{$ent} || $ExtGenEnt2SysId{$ent} ||
    $id || $ent;
}
##---------------------------------------------------------------------------
##	do_parm_entity() parses a parameter entity definition.
##
sub do_parm_entity {
    local(*line) = @_;
    local($name, $value);

    $line =~ s/^\s*$pero?\s+//o;	  # Remove pero, '%'
    $line =~ s/^(\S+)\s+//; $name = $1;   # Get entity name
    print STDERR "$ENTITY $pero_ $name\n" if $VERBOSE;

    if ($line =~ s/^$PUBLIC\s+//io) {	  	# PUBLIC external parm entity
	$PubParEntity{$name} = &get_next_group(*line)
	    unless defined($PubParEntity{$name});
    } elsif ($line =~ s/^$SYSTEM\s+//io) {	# SYSTEM external parm entity
	$SysParEntity{$name} = &get_next_group(*line)
	    unless defined($SysParEntity{$name});
    } else {				  	# Regular parm entity
	if (!defined($ParEntity{$name})) {
	    $value = &get_next_group(*line);
	    &del_comments(*value);
	    $ParEntity{$name} = $value;
	    push(@ParEntities, $name);
	}
    }
}
##---------------------------------------------------------------------------
##	do_gen_entity() parses a general entity definition.
##
sub do_gen_entity {
    local(*line) = @_;
    local($name, $tmp);

    $line =~ s/^\s*(\S+)\s+//; $name = $1;   # Get entity name
    print STDERR "$ENTITY $name\n" if $VERBOSE;
    $tmp = &get_next_group(*line);
    GENSW: {
	&do_ge_starttag($name, *line), last GENSW
	    if $tmp =~ /^\s*$STARTTAG\s*$/io;
	&do_ge_endtag($name, *line), last GENSW
	    if $tmp =~ /^\s*$ENDTAG\s*$/io;
	&do_ge_ms($name, *line), last GENSW
	    if $tmp =~ /^\s*$MS\s*$/io;
	&do_ge_md($name, *line), last GENSW
	    if $tmp =~ /^\s*$MD\s*$/io;
	&do_ge_pi($name, *line), last GENSW
	    if $tmp =~ /^\s*$PI\s*$/io;
	&do_ge_cdata($name, *line), last GENSW
	    if $tmp =~ /^\s*$CDATA\s*$/io;
	&do_ge_sdata($name, *line), last GENSW
	    if $tmp =~ /^\s*$SDATA\s*$/io;
	&do_ge_public($name, *line), last GENSW
	    if $tmp =~ /^\s*$PUBLIC\s*$/io;
	&do_ge_system($name, *line), last GENSW
	    if $tmp =~ /^\s*$SYSTEM\s*$/io;
	$_AGE{$name} = $GenEntity{$name} = $tmp;
    }
    push(@GenEntities, $name);
}
##---------------------------------------------------------------------------
sub do_ge_starttag {
    local($name, *line) = @_;
    local($tmp);

    $tmp = &get_next_group(*line);
    $StartTagEntity{$name} = $tmp;
}
##---------------------------------------------------------------------------
sub do_ge_endtag {
    local($name, *line) = @_;
    local($tmp);

    $tmp = &get_next_group(*line);
    $EndTagEntity{$name} = $tmp;
}
##---------------------------------------------------------------------------
sub do_ge_ms {
    local($name, *line) = @_;
    local($tmp);

    $tmp = &get_next_group(*line);
    $MSEntity{$name} = $tmp;
    $_AGE{$name} = $mdo_ . $mso_ . $tmp . $msc_ . $mdc_;
}
##---------------------------------------------------------------------------
sub do_ge_md {
    local($name, *line) = @_;
    local($tmp);

    $tmp = &get_next_group(*line);
    $MDEntity{$name} = $tmp;
    $_AGE{$name} = $mdo_ . $tmp . $mdc_;
}
##---------------------------------------------------------------------------
sub do_ge_pi {
    local($name, *line) = @_;
    local($tmp);

    $tmp = &get_next_group(*line);
    $PIEntity{$name} = $tmp;
    $_AGE{$name} = $pio_ . $tmp . $pic_;
}
##---------------------------------------------------------------------------
sub do_ge_cdata {
    local($name, *line) = @_;
    local($tmp);

    $tmp = &get_next_group(*line);
    $CDataEntity{$name} = $tmp;
}
##---------------------------------------------------------------------------
sub do_ge_sdata {
    local($name, *line) = @_;
    local($tmp);

    $tmp = &get_next_group(*line);
    $SDataEntity{$name} = $tmp;
}
##---------------------------------------------------------------------------
sub do_ge_public {
    local($name, *line) = @_;
    warn "General $PUBLIC entity skipped\n";
}
##---------------------------------------------------------------------------
sub do_ge_system {
    local($name, *line) = @_;
    warn "General $SYSTEM entity skipped\n";
}
##---------------------------------------------------------------------------
##	get_inc() gets the inclusion element group of an element
##	definition.
##
sub get_inc {
    local(*line) = @_;
    local($ret);
    $line =~ s/^$inc\s*//o;
    $ret = &get_next_group(*line);
    $ret;
}
##---------------------------------------------------------------------------
##	get_exc() gets the exclusion element group of an element
##	definition.
##
sub get_exc {
    local(*line) = @_;
    local($ret);
    $line =~ s/^$exc\s*//o;
    $ret = &get_next_group(*line);
    $ret;
}
##---------------------------------------------------------------------------
##	get_next_group gets the next group from a declaration.
##
sub get_next_group {
    local(*line) = @_;
    local($o, $c, $tmp, $ret);
    $ret = '';

    $line =~ s/^\s*//;
    $c = 0;
    if ($line =~ /^$grpo/o) {
	$o = 1;
	while ($o > $c) {
	    $line =~ s/^([^$grpc]*${grpc}[\?\+\*]?)//o;
	    $ret .= $1;
	    $tmp = $ret;
	    $o = $tmp =~ s/$grpo//go;
	    $c = $tmp =~ s/$grpc//go;
	}
	$line =~ s/^\s*//;
    } elsif ($line =~ /^[$quotes]/o) {
	$ret = &get_next_string(*line);
    } else {
	$line =~ s/^(\S+)\s*//; $ret = $1;
    }
    &zip_wspace(*ret);
    $ret;
}
##---------------------------------------------------------------------------
##	get_next_string() gets the next string from *line.  This
##	function is used by the do*entity routines.
##
sub get_next_string {
    local(*line) = @_;
    local($ret, $q);

    $line =~ s/^\s*([$quotes])//o; $q = $1;
    $line =~ s/^([^$q]*)$q\s*//; $ret = $1;
    &zip_wspace(*ret);
    $ret;
}
##---------------------------------------------------------------------------
##	is_quote_char() checks to see if $char is a quote character.
##
sub is_quote_char {
    local($char) = @_;
    $char =~ /[$quotes]/o;
}
##---------------------------------------------------------------------------
##      zip_wspace() takes a pointer to a string and strips all beginning
##      and ending whitespaces.  It also compresses all other whitespaces
##      into a single space character.
##
sub zip_wspace {
    local(*str) = @_;
    $str =~ s/^\s*(.*[^\s])\s*$/$1/;
    $str =~ s/\s{2,}/ /g;
}
##---------------------------------------------------------------------------
##      quote_chars() escapes special characters in case passed in string
##      will get be used in a pattern matching statement.  This prevents
##      the string from causing perl to barf because the string happens
##      to contain characters that have special meaning in pattern
##      matches.
##
sub quote_chars {
    local(*str) = @_;
    $str =~ s/(\W)/\\$1/g;
}
##---------------------------------------------------------------------------
sub unquote_chars {
    local(*str) = @_;
    $str =~ s/\\//g;
}
##---------------------------------------------------------------------------

##***************************************************************************##
##				TREE ROUTINES				     ##
##***************************************************************************##
##---------------------------------------------------------------------------##
##---------------------------------------------------------------------------##

$MAXLEVEL = 5;		# Default tree depth (root element has depth = 1)
$TREEFILE = 'STDOUT';	# Default output file

			    ##----------------##
			    ## Main Functions ##
			    ##----------------##
##---------------------------------------------------------------------------
##	DTDprint_tree() outputs the tree hierarchy of $elem to the
##	filehandle specified by $handle.  $depth specifies the maximum
##	depth of the tree.
##
##      The routine cuts at elements that exist at
##      higher (or equal) levels or if $MAXLEVEL has been reached.  The
##      string "..." is appended to an element if has been cut-off due
##      to pre-existance at a higher (or equal) level.
##
##      Cutting the tree at repeat elements is necessary to avoid
##      a combinatorical explosion with recursive element definitions.
##      Plus, it does not make much since to repeat information.
##
sub main::DTDprint_tree {
    local($elem, $depth, $handle) = @_;
    local(%inc, %exc, %done, %open);
    $MAXLEVEL = $depth if ($depth > 0);
    $TREEFILE = $handle if $handle;
    &print_elem($elem, 1);
    $elem =~ tr/A-Z/a-z/;
    &compute_levels($elem, 1, *inc, *exc, *done); # Compute prune values
    %inc = (); %exc = ();
    &print_sub_tree($elem, 2, *inc, *exc, *done); # Print tree
}
##---------------------------------------------------------------------------
			    ##---------------##
			    ## DTD Functions ##
			    ##---------------##
##---------------------------------------------------------------------------
##	compute_levels() is the first pass over the element content
##	hierarchy.  It determines the highest level each element occurs
##	in the DTD.
##
sub compute_levels {
    local($elem, $level, *inc, *exc, *done) = @_;
    local(@array, @incarray, @excarray, %notdone, %lexc);

    return if $level > $MAXLEVEL;

    $done{$elem} = $level if ($level < $done{$elem} || !$done{$_});

    ## Get inclusion elements ##
    @incarray = sort &extract_elem_names($ElemInc{$elem});
    foreach (@incarray) { $inc{$_}++; }

    ## Get element contents ##
    @array = (@incarray, &extract_elem_names($ElemCont{$elem}));
    &remove_dups(*array);
    foreach (@array) {
        next if &'DTDis_elem_keyword($_);
        $done{$_} = $level+1, $notdone{$_} = 1
            if ($level+1 < $done{$_} || !$done{$_});
    }

    ## Get exclusion elements ##
    @excarray = sort &extract_elem_names($ElemExc{$elem});
    foreach (@excarray) { $exc{$_}++; $lexc{$_} = 1; }

    ## Compute sub tree ##
    foreach (sort @array) {
        next if &::DTDis_elem_keyword($_);
        if (!$lexc{$_}) {
            &compute_levels($_, $level+1, *inc, *exc, *done),
                $notdone{$_} = 0  if ($level < $MAXLEVEL &&
                                      ($level+1 < $done{$_} || $notdone{$_}));
        }
    }
    ## Remove include elements ##
    foreach (@incarray) { $inc{$_}--; }
    ## Remove exclude elements ##
    foreach (@excarray) { $exc{$_}--; }
}
##---------------------------------------------------------------------------
##	print_sub_tree() is the second pass of an element content
##	hierarchy.  It actually prints the tree, and it uses the
##	%done array built by compute_levels() to perform pruning.
##
sub print_sub_tree {
    local($elem, $level, *inc, *exc, *done, *open) = @_;
    local($tmp, $i, @array, @incarray, @excarray, %lexc);

    return if $level > $MAXLEVEL;
    $done{$elem} = 0;	# Set done value so $elem tree is printed only once.

    ## List inclusion elements due to ancestors ##
    @incarray = sort grep($inc{$_} > 0, sort keys %inc);
    if ($#incarray >= 0 ) {
        $tmp = '(Ia):';
        foreach (@incarray) { $tmp .= ' ' . $_; }
        &print_elem($tmp, $level, *open);
    }

    ## List exclusion elements due to ancestors ##
    @excarray = sort grep($exc{$_} > 0, sort keys %exc);
    if ($#excarray >= 0 ) {
        $tmp = '(Xa):';
        foreach (@excarray) { $tmp .= ' ' . $_; }
        &print_elem($tmp, $level, *open);
    }

    ## Get inclusion elements ##
    @incarray = sort &extract_elem_names($ElemInc{$elem});
    $tmp = '(I):' if $#incarray >= 0;
    foreach (@incarray) {
        $inc{$_}++;
        $tmp .= ' ' . $_;
    }
    &print_elem($tmp, $level, *open) if $#incarray >= 0;

    ## Get element contents ##
    @array = (@incarray, &extract_elem_names($ElemCont{$elem}));
    &remove_dups(*array);

    ## Get exclusion elements ##
    @excarray = sort &extract_elem_names($ElemExc{$elem});
    $tmp = '(X):' if $#excarray >= 0;
    foreach (@excarray) {
        $exc{$_}++; $lexc{$_} = 1;
        $tmp .= ' ' . $_;
    }
    &print_elem($tmp, $level, *open) if $#excarray >= 0;

    &print_elem(' |', $level, *open);

    ## Output sub tree ##
    $i = 0;
    foreach (sort @array) {
        $open{$level} = ($i < $#array ? 1 : 0); $i++;
        if (s/^\s*($elem_keywords)\s*$/\U$1/oi) {
            &print_elem($_, $level, *open);
        } elsif (!$lexc{$_}) {
            &print_elem($_ . ($done{$_} < $level ? " ..." : ""),
                        $level, *open);
            &print_sub_tree($_, $level+1, *inc, *exc, *done, *open)
                if ($level < $MAXLEVEL && $level == $done{$_});
        }
    }
    &print_elem("", $level, *open);

    ## Remove include elements ##
    foreach (@incarray) { $inc{$_}--; }
    ## Remove exclude elements ##
    foreach (@excarray) { $exc{$_}--; }
}
##---------------------------------------------------------------------------
##	print_elem() is used by print_sub_tree() to output the elements
##	in a structured format to $TREEFILE.
##
sub print_elem {
    local($elem, $level, *open) = @_;
    local($i, $indent);
    if ($level == 1) {
	print($TREEFILE $elem, "\n"); }
    else {
	for ($i=2; $i < $level; $i++) {
	    $indent .= ($open{$i} ? " | " : "   "); }
	if ($elem ne "") {
	    if ($elem =~ /\(/) { $indent .= " | "; }
	    elsif ($elem !~ /\|/) { $indent .= " |_"; }
	}
	print($TREEFILE $indent, $elem, "\n");
    }
}
##---------------------------------------------------------------------------
##	remove_dups() removes duplicate elements in *array.
sub remove_dups {
    local(*array) = shift;
    local(%dup);
    @array = grep($dup{$_}++ < 1, @array);
}
##---------------------------------------------------------------------------##

1;
