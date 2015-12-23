#!/usr/bin/perl

#
# revo::decode.pm
# 
# 2008-02-13 Wieland Pusch
#

use strict;
#use warnings;

package revo::decode;

use utf8;
use Encode;
use HTML::Entities;

######################################################################
sub rvdecode {
  my $enc = "utf-8";
  my $str = shift @_;
#  print "decode $str\n";
  $str = Encode::decode($enc, $str);

#  print "encode ".Encode::encode($enc, $str)."\n";

  # <!-- e-aj literoj -->
  $str =~ s/&Ccirc;/\x{0108}/smg;
  $str =~ s/&ccirc;/\x{0109}/smg;
  $str =~ s/&Gcirc;/\x{011c}/smg;
  $str =~ s/&gcirc;/\x{011d}/smg;
  $str =~ s/&Hcirc;/\x{0124}/smg;
  $str =~ s/&hcirc;/\x{0125}/smg;
  $str =~ s/&Jcirc;/\x{0134}/smg;
  $str =~ s/&jcirc;/\x{0135}/smg;
  $str =~ s/&Scirc;/\x{015c}/smg;
  $str =~ s/&scirc;/\x{015d}/smg;
  $str =~ s/&Ubreve;/\x{016c}/smg;
  $str =~ s/&ubreve;/\x{016d}/smg;

  # <!-- francaj k.a. -->
#  $str =~ s/\x{0152}/&OElig;/g;
#  $str =~ s/\x{0153}/&oelig;/g;
#  $str =~ s/\x{00c1}/&Aacute;/g;
#  $str =~ s/\x{00e1}/&aacute;/g;
#  $str =~ s/\x{00c9}/&Eacute;/g;
  $str =~ s/&eacute;/\x{00e9}/smg;
#  $str =~ s/\x{00cd}/&Iacute;/g;
#  $str =~ s/\x{00ed}/&iacute;/g;
  $str =~ s/&Oacute;/\x{00d3}/smg;
  $str =~ s/&oacute;/\x{00f3}/smg;
#  $str =~ s/\x{00da}/&Uacute;/g;
#  $str =~ s/\x{00fa}/&uacute;/g;
#
  $str =~ s/&Agrave;/\x{00c0}/g;
  $str =~ s/&agrave;/\x{00e0}/g;
  $str =~ s/&Egrave;/\x{00c8}/g;
  $str =~ s/&egrave;/\x{00e8}/g;
  $str =~ s/&Igrave;/\x{00cc}/g;
  $str =~ s/&igrave;/\x{00ec}/g;
  $str =~ s/&Ograve;/\x{00d2}/g;
  $str =~ s/&ograve;/\x{00f2}/g;
  $str =~ s/&Ugrave;/\x{00d9}/g;
  $str =~ s/&ugrave;/\x{00f9}/g;

  $str =~ s/&Acirc;/\x{00c2}/g;
  $str =~ s/&acirc;/\x{00e2}/g;
  $str =~ s/&Ecirc;/\x{00ca}/g;
  $str =~ s/&ecirc;/\x{00ea}/g;
  $str =~ s/&Icirc;/\x{00ce}/g;
  $str =~ s/&icirc;/\x{00ee}/g;
  $str =~ s/&Ocirc;/\x{00d4}/g;
  $str =~ s/&ocirc;/\x{00f4}/g;
  $str =~ s/&Ucirc;/\x{00db}/g;
  $str =~ s/&ucirc;/\x{00fb}/g;

  # <!-- germanaj -->
  $str =~ s/&szlig;/\x{00df}/g;
  $str =~ s/&Auml;/\x{00c4}/g;
  $str =~ s/&auml;/\x{00e4}/g;
  $str =~ s/&Ouml;/\x{00d6}/g;
  $str =~ s/&ouml;/\x{00f6}/g;
  $str =~ s/&Uuml;/\x{00dc}/g;
  $str =~ s/&uuml;/\x{00fc}/g;

  # <!-- turkaj ne jam menciitaj -->
  $str =~ s/&Gbreve;/\x{011e}/g;
  $str =~ s/&gbreve;/\x{011f}/g;
  $str =~ s/&inodot;/\x{0131}/smg;
  $str =~ s/&Idot;/\x{0130}/smg;
  $str =~ s/&Scedil;/\x{015e}/g;
  $str =~ s/&scedil;/\x{015f}/g;
  $str =~ s/&Ccedil;/\x{00c7}/g;
  $str =~ s/&ccedil;/\x{00e7}/g;

  # <!-- diversaj -->
  $str =~ s/&#60;/&lt;/g;
  $str =~ s/&#62;/&gt;/g;
#  $str =~ s/</&lt;/g;
#  $str =~ s/>/&gt;/g;
#  $str =~ s/'/&apos;/g;
##  $str =~ s/'/&minute;/g;
#  $str =~ s/"/&quot;/g;
##  $str =~ s/\x{0034}/&second;/g;
  $str =~ s/&leftquot;/\x{201e}/smg;
  $str =~ s/&rightquot;/\x{201c}/smg;
##  $str =~ s/\x{00b0}/&ring;/g;
#  $str =~ s/\x{00b0}/&deg;/g;
#  $str =~ s/\x{00b2}/&quadrat;/g;
#  $str =~ s/\x{00b3}/&cubic;/g;
#  $str =~ s/\x{00B6}/&para;/g;
  $str =~ s/&FE;/\x{00A7}/g;
#  $str =~ s/\x{2015}/&dash;/g;
  $str =~ s/&mdash;/\x{2014}/g;
#  $str =~ s/\x{2013}/&ndash;/g;
#  $str =~ s/\x{00a0}/&nbsp;/g;

  $str =~ s/&Euml;/\x{00cb}/g;
  $str =~ s/&euml;/\x{00eb}/g;
  $str =~ s/&Iuml;/\x{00cf}/g;
  $str =~ s/&iuml;/\x{00ef}/g;

  $str =~ s/&Aring;/\x{00c5}/g;
  $str =~ s/&aring;/\x{00e5}/g;
  $str =~ s/&AElig;/\x{00c6}/g;
  $str =~ s/&aelig;/\x{00e6}/g;
  $str =~ s/&Oslash;/\x{00d8}/g;
  $str =~ s/&oslash;/\x{00f8}/g;

  # <!-- portugalaj, hispanaj, katalunaj -->
  $str =~ s/&Ntilde;/\x{00d1}/g;
  $str =~ s/&ntilde;/\x{00f1}/g;

  $str =~ s/&Atilde;/\x{00c3}/g;
  $str =~ s/&atilde;/\x{00e3}/g;
  $str =~ s/&Otilde;/\x{00d5}/g;
  $str =~ s/&otilde;/\x{00f5}/g;

  $str =~ s/&middot;/\x{00b7}/g;

  # <!-- rumanaj -->
  $str =~ s/&Abreve;/\x{0102}/g;
  $str =~ s/&abreve;/\x{0103}/g;
  $str =~ s/&Tcedil;/\x{0162}/g;
  $str =~ s/&tcedil;/\x{0163}/g;

  # <!-- grekaj -->
  $str =~ s/&Alfa;/\x{0391}/g;
  $str =~ s/&alfa;/\x{03b1}/g;
  $str =~ s/&alfa_acute;/\x{1f71}/g;
  $str =~ s/&Alfa_acute;/\x{1fbb}/g;
  $str =~ s/&alfa_acute_subj;/\x{1fb4}/g;
  $str =~ s/&alfa_breve;/\x{1fb0}/g;
  $str =~ s/&Alfa_breve;/\x{1fb8}/g;
  $str =~ s/&alfa_circ;/\x{1fb6}/g;
  $str =~ s/&alfa_circ_subj;/\x{1fb7}/g;
  $str =~ s/&alfa_densa;/\x{1f01}/g;
  $str =~ s/&Alfa_densa;/\x{1f09}/g;
  $str =~ s/&alfa_densa_acute;/\x{1f05}/g;
  $str =~ s/&Alfa_densa_acute;/\x{1f0d}/g;
  $str =~ s/&alfa_densa_acute_subj;/\x{1f85}/g;
  $str =~ s/&Alfa_densa_acute_Subj;/\x{1f8d}/g;
  $str =~ s/&alfa_densa_circ;/\x{1f07}/g;
  $str =~ s/&Alfa_densa_circ;/\x{1f0f}/g;
  $str =~ s/&alfa_densa_circ_subj;/\x{1f87}/g;
  $str =~ s/&Alfa_densa_circ_Subj;/\x{1f8f}/g;
  $str =~ s/&alfa_densa_grave;/\x{1f03}/g;
  $str =~ s/&Alfa_densa_grave;/\x{1f0b}/g;
  $str =~ s/&alfa_densa_grave_subj;/\x{1f83}/g;
  $str =~ s/&Alfa_densa_grave_Subj;/\x{1f8b}/g;
  $str =~ s/&alfa_densa_subj;/\x{1f81}/g;
  $str =~ s/&Alfa_densa_Subj;/\x{1f89}/g;
  $str =~ s/&alfa_grave;/\x{1f70}/g;
  $str =~ s/&Alfa_grave;/\x{1fba}/g;
  $str =~ s/&alfa_grave_subj;/\x{1fb2}/g;
  $str =~ s/&alfa_makron;/\x{1fb1}/g;
  $str =~ s/&Alfa_makron;/\x{1fb9}/g;
  $str =~ s/&alfa_psili;/\x{1f00}/g;
  $str =~ s/&Alfa_psili;/\x{1f08}/g;
  $str =~ s/&alfa_psili_acute;/\x{1f04}/g;
  $str =~ s/&Alfa_psili_acute;/\x{1f0c}/g;
  $str =~ s/&alfa_psili_acute_subj;/\x{1f84}/g;
  $str =~ s/&Alfa_psili_acute_Subj;/\x{1f8c}/g;
  $str =~ s/&alfa_psili_circ;/\x{1f06}/g;
  $str =~ s/&Alfa_psili_circ;/\x{1f0e}/g;
  $str =~ s/&alfa_psili_circ_subj;/\x{1f86}/g;
  $str =~ s/&Alfa_psili_circ_Subj;/\x{1f8e}/g;
  $str =~ s/&alfa_psili_grave;/\x{1f02}/g;
  $str =~ s/&Alfa_psili_grave;/\x{1f0a}/g;
  $str =~ s/&alfa_psili_grave_subj;/\x{1f82}/g;
  $str =~ s/&Alfa_psili_grave_Subj;/\x{1f8a}/g;
  $str =~ s/&alfa_psili_subj;/\x{1f80}/g;
  $str =~ s/&Alfa_psili_Subj;/\x{1f88}/g;
  $str =~ s/&alfa_subj;/\x{1fb3}/g;
  $str =~ s/&Alfa_Subj;/\x{1fbc}/g;
  $str =~ s/&Alfa_ton;/\x{0386}/g;
  $str =~ s/&alfa_ton;/\x{03ac}/g;

  $str =~ s/&Beta;/\x{0392}/g;
  $str =~ s/&beta;/\x{03b2}/g;

  $str =~ s/&Gamma;/\x{0393}/g;
  $str =~ s/&gamma;/\x{03b3}/g;

  $str =~ s/&Delta;/\x{0394}/g;
  $str =~ s/&delta;/\x{03b4}/g;

  $str =~ s/&Epsilon;/\x{0395}/g;
  $str =~ s/&epsilon;/\x{03b5}/g;
  $str =~ s/&epsilon_acute;/\x{1f73}/g;
  $str =~ s/&Epsilon_acute;/\x{1fc9}/g;
  $str =~ s/&epsilon_densa;/\x{1f11}/g;
  $str =~ s/&Epsilon_densa;/\x{1f19}/g;
  $str =~ s/&epsilon_densa_acute;/\x{1f15}/g;
  $str =~ s/&Epsilon_densa_acute;/\x{1f1d}/g;
  $str =~ s/&epsilon_densa_grave;/\x{1f13}/g;
  $str =~ s/&Epsilon_densa_grave;/\x{1f1b}/g;
  $str =~ s/&epsilon_grave;/\x{1f72}/g;
  $str =~ s/&Epsilon_grave;/\x{1fc8}/g;
  $str =~ s/&epsilon_psili;/\x{1f10}/g;
  $str =~ s/&Epsilon_psili;/\x{1f18}/g;
  $str =~ s/&epsilon_psili_acute;/\x{1f14}/g;
  $str =~ s/&Epsilon_psili_acute;/\x{1f1c}/g;
  $str =~ s/&epsilon_psili_grave;/\x{1f12}/g;
  $str =~ s/&Epsilon_psili_grave;/\x{1f1a}/g;
  $str =~ s/&Epsilon_ton;/\x{0388}/g;
  $str =~ s/&epsilon_ton;/\x{03ad}/g;

  $str =~ s/&Zeta;/\x{0396}/g;
  $str =~ s/&zeta;/\x{03b6}/g;

  $str =~ s/&Eta;/\x{0397}/g;
  $str =~ s/&eta;/\x{03b7}/g;
  $str =~ s/&eta_acute;/\x{1f75}/g;
  $str =~ s/&Eta_acute;/\x{1fcb}/g;
  $str =~ s/&eta_acute_subj;/\x{1fc4}/g;
  $str =~ s/&eta_circ;/\x{1fc6}/g;
  $str =~ s/&eta_circ_subj;/\x{1fc7}/g;
  $str =~ s/&eta_densa;/\x{1f21}/g;
  $str =~ s/&Eta_densa;/\x{1f29}/g;
  $str =~ s/&eta_densa_acute;/\x{1f25}/g;
  $str =~ s/&Eta_densa_acute;/\x{1f2d}/g;
  $str =~ s/&eta_densa_acute_subj;/\x{1f95}/g;
  $str =~ s/&Eta_densa_acute_Subj;/\x{1f9d}/g;
  $str =~ s/&eta_densa_circ;/\x{1f27}/g;
  $str =~ s/&Eta_densa_circ;/\x{1f2f}/g;
  $str =~ s/&eta_densa_circ_subj;/\x{1f97}/g;
  $str =~ s/&Eta_densa_circ_Subj;/\x{1f9f}/g;
  $str =~ s/&eta_densa_grave;/\x{1f23}/g;
  $str =~ s/&Eta_densa_grave;/\x{1f2b}/g;
  $str =~ s/&eta_densa_grave_subj;/\x{1f93}/g;
  $str =~ s/&Eta_densa_grave_Subj;/\x{1f9b}/g;
  $str =~ s/&eta_densa_subj;/\x{1f91}/g;
  $str =~ s/&Eta_densa_Subj;/\x{1f99}/g;
  $str =~ s/&eta_grave;/\x{1f74}/g;
  $str =~ s/&Eta_grave;/\x{1fca}/g;
  $str =~ s/&eta_grave_subj;/\x{1fc2}/g;
  $str =~ s/&eta_psili;/\x{1f20}/g;
  $str =~ s/&Eta_psili;/\x{1f28}/g;
  $str =~ s/&eta_psili_acute;/\x{1f24}/g;
  $str =~ s/&Eta_psili_acute;/\x{1f2c}/g;
  $str =~ s/&eta_psili_acute_subj;/\x{1f94}/g;
  $str =~ s/&Eta_psili_acute_Subj;/\x{1f9c}/g;
  $str =~ s/&eta_psili_circ;/\x{1f26}/g;
  $str =~ s/&Eta_psili_circ;/\x{1f2e}/g;
  $str =~ s/&eta_psili_circ_subj;/\x{1f96}/g;
  $str =~ s/&Eta_psili_circ_Subj;/\x{1f9e}/g;
  $str =~ s/&eta_psili_grave;/\x{1f22}/g;
  $str =~ s/&Eta_psili_grave;/\x{1f2a}/g;
  $str =~ s/&eta_psili_grave_subj;/\x{1f92}/g;
  $str =~ s/&Eta_psili_grave_Subj;/\x{1f9a}/g;
  $str =~ s/&eta_psili_subj;/\x{1f90}/g;
  $str =~ s/&Eta_psili_Subj;/\x{1f98}/g;
  $str =~ s/&eta_subj;/\x{1fc3}/g;
  $str =~ s/&Eta_Subj;/\x{1fcc}/g;
  $str =~ s/&Eta_ton;/\x{0389}/g;
  $str =~ s/&eta_ton;/\x{03ae}/g;

  $str =~ s/&Theta;/\x{0398}/g;
  $str =~ s/&theta;/\x{03b8}/g;

  $str =~ s/&Jota;/\x{0399}/g;
  $str =~ s/&jota;/\x{03b9}/g;
  $str =~ s/&jota_acute;/\x{1f77}/g;
  $str =~ s/&Jota_acute;/\x{1fdb}/g;
  $str =~ s/&jota_breve;/\x{1fd0}/g;
  $str =~ s/&Jota_breve;/\x{1fd8}/g;
  $str =~ s/&jota_circ;/\x{1fd6}/g;
  $str =~ s/&jota_densa;/\x{1f31}/g;
  $str =~ s/&Jota_densa;/\x{1f39}/g;
  $str =~ s/&jota_densa_acute;/\x{1f35}/g;
  $str =~ s/&Jota_densa_acute;/\x{1f3d}/g;
  $str =~ s/&jota_densa_circ;/\x{1f37}/g;
  $str =~ s/&Jota_densa_circ;/\x{1f3f}/g;
  $str =~ s/&jota_densa_grave;/\x{1f33}/g;
  $str =~ s/&Jota_densa_grave;/\x{1f3b}/g;
  $str =~ s/&jota_grave;/\x{1f76}/g;
  $str =~ s/&Jota_grave;/\x{1fda}/g;
  $str =~ s/&jota_makron;/\x{1fd1}/g;
  $str =~ s/&Jota_makron;/\x{1fd9}/g;
  $str =~ s/&jota_psili;/\x{1f30}/g;
  $str =~ s/&Jota_psili;/\x{1f38}/g;
  $str =~ s/&jota_psili_acute;/\x{1f34}/g;
  $str =~ s/&Jota_psili_acute;/\x{1f3c}/g;
  $str =~ s/&jota_psili_circ;/\x{1f36}/g;
  $str =~ s/&Jota_psili_circ;/\x{1f3e}/g;
  $str =~ s/&jota_psili_grave;/\x{1f32}/g;
  $str =~ s/&Jota_psili_grave;/\x{1f3a}/g;
  $str =~ s/&Jota_ton;/\x{038a}/g;
  $str =~ s/&jota_ton;/\x{03af}/g;
  $str =~ s/&Jota_trema;/\x{03aa}/g;
  $str =~ s/&jota_trema;/\x{03ca}/g;
  $str =~ s/&jota_trema_acute;/\x{1fd3}/g;
  $str =~ s/&jota_trema_circ;/\x{1fd7}/g;
  $str =~ s/&jota_trema_grave;/\x{1fd2}/g;
  $str =~ s/&jota_trema_ton;/\x{0390}/g;

  $str =~ s/&Kappa;/\x{039a}/g;
  $str =~ s/&kappa;/\x{03ba}/g;
  $str =~ s/&Lambda;/\x{039b}/g;
  $str =~ s/&lambda;/\x{03bb}/g;
  $str =~ s/&My;/\x{039c}/g;
  $str =~ s/&my;/\x{03bc}/g;
  $str =~ s/&Ny;/\x{039d}/g;
  $str =~ s/&ny;/\x{03bd}/g;
  $str =~ s/&Xi;/\x{039e}/g;
  $str =~ s/&xi;/\x{03be}/g;

  $str =~ s/&Omikron;/\x{039f}/g;
  $str =~ s/&omikron;/\x{03bf}/g;
  $str =~ s/&omikron_acute;/\x{1f79}/g;
  $str =~ s/&Omikron_acute;/\x{1ff9}/g;
  $str =~ s/&omikron_densa;/\x{1f41}/g;
  $str =~ s/&Omikron_densa;/\x{1f49}/g;
  $str =~ s/&omikron_densa_acute;/\x{1f45}/g;
  $str =~ s/&Omikron_densa_acute;/\x{1f4d}/g;
  $str =~ s/&omikron_densa_grave;/\x{1f43}/g;
  $str =~ s/&Omikron_densa_grave;/\x{1f4b}/g;
  $str =~ s/&omikron_grave;/\x{1f78}/g;
  $str =~ s/&Omikron_grave;/\x{1ff8}/g;
  $str =~ s/&omikron_psili;/\x{1f40}/g;
  $str =~ s/&Omikron_psili;/\x{1f48}/g;
  $str =~ s/&omikron_psili_acute;/\x{1f44}/g;
  $str =~ s/&Omikron_psili_acute;/\x{1f4c}/g;
  $str =~ s/&omikron_psili_grave;/\x{1f42}/g;
  $str =~ s/&Omikron_psili_grave;/\x{1f4a}/g;
  $str =~ s/&Omikron_ton;/\x{038c}/g;
  $str =~ s/&omikron_ton;/\x{03cc}/g;

  $str =~ s/&Pi;/\x{03a0}/g;
  $str =~ s/&pi;/\x{03c0}/g;

  $str =~ s/&Rho;/\x{03a1}/g;
  $str =~ s/&rho;/\x{03c1}/g;
  $str =~ s/&rho_densa;/\x{1fe5}/g;
  $str =~ s/&Rho_densa;/\x{1fec}/g;
  $str =~ s/&rho_psili;/\x{1fe4}/g;

  $str =~ s/&Sigma;/\x{03a3}/g;
  $str =~ s/&sigma;/\x{03c3}/g;
  $str =~ s/&sigma_fina;/\x{03c2}/g;

  $str =~ s/&Tau;/\x{03a4}/g;
  $str =~ s/&tau;/\x{03c4}/g;

  $str =~ s/&Ypsilon;/\x{03a5}/g;
  $str =~ s/&ypsilon;/\x{03c5}/g;
  $str =~ s/&ypsilon_acute;/\x{1f7b}/g;
  $str =~ s/&Ypsilon_acute;/\x{1feb}/g;
  $str =~ s/&ypsilon_breve;/\x{1fe0}/g;
  $str =~ s/&Ypsilon_breve;/\x{1fe8}/g;
  $str =~ s/&ypsilon_circ;/\x{1fe6}/g;
  $str =~ s/&ypsilon_densa;/\x{1f51}/g;
  $str =~ s/&Ypsilon_densa;/\x{1f59}/g;
  $str =~ s/&ypsilon_densa_acute;/\x{1f55}/g;
  $str =~ s/&Ypsilon_densa_acute;/\x{1f5d}/g;
  $str =~ s/&ypsilon_densa_circ;/\x{1f57}/g;
  $str =~ s/&Ypsilon_densa_circ;/\x{1f5f}/g;
  $str =~ s/&ypsilon_densa_grave;/\x{1f53}/g;
  $str =~ s/&Ypsilon_densa_grave;/\x{1f5b}/g;
  $str =~ s/&ypsilon_grave;/\x{1f7a}/g;
  $str =~ s/&Ypsilon_grave;/\x{1fea}/g;
  $str =~ s/&ypsilon_makron;/\x{1fe1}/g;
  $str =~ s/&Ypsilon_makron;/\x{1fe9}/g;
  $str =~ s/&ypsilon_psili;/\x{1f50}/g;
  $str =~ s/&ypsilon_psili_acute;/\x{1f54}/g;
  $str =~ s/&ypsilon_psili_circ;/\x{1f56}/g;
  $str =~ s/&ypsilon_psili_grave;/\x{1f52}/g;
  $str =~ s/&Ypsilon_ton;/\x{038e}/g;
  $str =~ s/&ypsilon_ton;/\x{03cd}/g;
  $str =~ s/&Ypsilon_trema;/\x{03ab}/g;
  $str =~ s/&ypsilon_trema;/\x{03cb}/g;
  $str =~ s/&ypsilon_trema_acute;/\x{1fe3}/g;
  $str =~ s/&ypsilon_trema_circ;/\x{1fe7}/g;
  $str =~ s/&ypsilon_trema_grave;/\x{1fe2}/g;
  $str =~ s/&ypsilon_trema_ton;/\x{03b0}/g;

  $str =~ s/&Phi;/\x{03a6}/g;
  $str =~ s/&phi;/\x{03c6}/g;
  $str =~ s/&Chi;/\x{03a7}/g;
  $str =~ s/&chi;/\x{03c7}/g;
  $str =~ s/&Psi;/\x{03a8}/g;
  $str =~ s/&psi;/\x{03c8}/g;

  $str =~ s/&Omega;/\x{03a9}/g;
  $str =~ s/&omega;/\x{03c9}/g;
  $str =~ s/&omega_acute;/\x{1f7d}/g;
  $str =~ s/&Omega_acute;/\x{1ffb}/g;
  $str =~ s/&omega_acute_subj;/\x{1ff4}/g;
  $str =~ s/&omega_circ;/\x{1ff6}/g;
  $str =~ s/&omega_circ_subj;/\x{1ff7}/g;
  $str =~ s/&omega_densa;/\x{1f61}/g;
  $str =~ s/&Omega_densa;/\x{1f69}/g;
  $str =~ s/&omega_densa_acute;/\x{1f65}/g;
  $str =~ s/&Omega_densa_acute;/\x{1f6d}/g;
  $str =~ s/&omega_densa_acute_subj;/\x{1fa5}/g;
  $str =~ s/&Omega_densa_acute_Subj;/\x{1fad}/g;
  $str =~ s/&omega_densa_circ;/\x{1f67}/g;
  $str =~ s/&Omega_densa_circ;/\x{1f6f}/g;
  $str =~ s/&omega_densa_circ_subj;/\x{1fa7}/g;
  $str =~ s/&Omega_densa_circ_Subj;/\x{1faf}/g;
  $str =~ s/&omega_densa_grave;/\x{1f63}/g;
  $str =~ s/&Omega_densa_grave;/\x{1f6b}/g;
  $str =~ s/&omega_densa_grave_subj;/\x{1fa3}/g;
  $str =~ s/&Omega_densa_grave_Subj;/\x{1fab}/g;
  $str =~ s/&omega_densa_subj;/\x{1fa1}/g;
  $str =~ s/&Omega_densa_Subj;/\x{1fa9}/g;
  $str =~ s/&omega_grave;/\x{1f7c}/g;
  $str =~ s/&Omega_grave;/\x{1ffa}/g;
  $str =~ s/&omega_grave_subj;/\x{1ff2}/g;
  $str =~ s/&omega_psili;/\x{1f60}/g;
  $str =~ s/&Omega_psili;/\x{1f68}/g;
  $str =~ s/&omega_psili_acute;/\x{1f64}/g;
  $str =~ s/&Omega_psili_acute;/\x{1f6c}/g;
  $str =~ s/&omega_psili_acute_subj;/\x{1fa4}/g;
  $str =~ s/&Omega_psili_acute_Subj;/\x{1fac}/g;
  $str =~ s/&omega_psili_circ;/\x{1f66}/g;
  $str =~ s/&Omega_psili_circ;/\x{1f6e}/g;
  $str =~ s/&omega_psili_circ_subj;/\x{1fa6}/g;
  $str =~ s/&Omega_psili_circ_Subj;/\x{1fae}/g;
  $str =~ s/&omega_psili_grave;/\x{1f62}/g;
  $str =~ s/&Omega_psili_grave;/\x{1f6a}/g;
  $str =~ s/&omega_psili_grave_subj;/\x{1fa2}/g;
  $str =~ s/&Omega_psili_grave_Subj;/\x{1faa}/g;
  $str =~ s/&omega_psili_subj;/\x{1fa0}/g;
  $str =~ s/&Omega_psili_Subj;/\x{1fa8}/g;
  $str =~ s/&omega_subj;/\x{1ff3}/g;
  $str =~ s/&Omega_Subj;/\x{1ffc}/g;
  $str =~ s/&Omega_ton;/\x{038f}/g;
  $str =~ s/&omega_ton;/\x{03ce}/g;

  # <!-- cirilaj -->
  $str =~ s/&c_Ju;/\x{042e}/smg;
  $str =~ s/&c_A;/\x{0410}/smg;
  $str =~ s/&c_B;/\x{0411}/smg;
  $str =~ s/&c_C;/\x{0426}/smg;
  $str =~ s/&c_D;/\x{0414}/smg;
  $str =~ s/&c_Je;/\x{0415}/smg;
  $str =~ s/&c_F;/\x{0424}/smg;
  $str =~ s/&c_G;/\x{0413}/smg;
  $str =~ s/&c_H;/\x{0425}/smg;
  $str =~ s/&c_I;/\x{0418}/smg;
  $str =~ s/&c_J;/\x{0419}/smg;
  $str =~ s/&c_K;/\x{041a}/smg;
  $str =~ s/&c_L;/\x{041b}/smg;
  $str =~ s/&c_M;/\x{041c}/smg;
  $str =~ s/&c_N;/\x{041d}/smg;
  $str =~ s/&c_O;/\x{041e}/smg;
  $str =~ s/&c_P;/\x{041f}/smg;
  $str =~ s/&c_Ja;/\x{042f}/smg;
  $str =~ s/&c_R;/\x{0420}/smg;
  $str =~ s/&c_S;/\x{0421}/smg;
  $str =~ s/&c_T;/\x{0422}/smg;
  $str =~ s/&c_U;/\x{0423}/smg;
  $str =~ s/&c_Zh;/\x{0416}/smg;
  $str =~ s/&c_V;/\x{0412}/smg;
  $str =~ s/&c_Mol;/\x{042c}/smg;
  $str =~ s/&c_Y;/\x{042b}/smg;
  $str =~ s/&c_Z;/\x{0417}/smg;
  $str =~ s/&c_Sh;/\x{0428}/smg;
  $str =~ s/&c_E;/\x{042d}/smg;
  $str =~ s/&c_Shch;/\x{0429}/smg;
  $str =~ s/&c_Ch;/\x{0427}/smg;

  $str =~ s/&c_Jo;/\x{0401}/smg;
  $str =~ s/&c_W;/\x{040E}/smg;
  $str =~ s/&c_Ib;/\x{0406}/smg;
  $str =~ s/&c_Gu;/\x{0490}/smg;
  $str =~ s/&c_Jeu;/\x{0404}/smg;
  $str =~ s/&c_Ji;/\x{0407}/smg;

  $str =~ s/&c_ju;/\x{044e}/smg;
  $str =~ s/&c_a;/\x{0430}/smg;
  $str =~ s/&c_b;/\x{0431}/smg;
  $str =~ s/&c_c;/\x{0446}/smg;
  $str =~ s/&c_d;/\x{0434}/smg;
  $str =~ s/&c_je;/\x{0435}/smg;
  $str =~ s/&c_f;/\x{0444}/smg;
  $str =~ s/&c_g;/\x{0433}/smg;
  $str =~ s/&c_h;/\x{0445}/smg;
  $str =~ s/&c_i;/\x{0438}/smg;
  $str =~ s/&c_j;/\x{0439}/smg;
  $str =~ s/&c_k;/\x{043a}/smg;
  $str =~ s/&c_l;/\x{043b}/smg;
  $str =~ s/&c_m;/\x{043c}/smg;
  $str =~ s/&c_n;/\x{043d}/smg;
  $str =~ s/&c_o;/\x{043e}/smg;
  $str =~ s/&c_p;/\x{043f}/smg;
  $str =~ s/&c_ja;/\x{044f}/smg;
  $str =~ s/&c_r;/\x{0440}/smg;
  $str =~ s/&c_s;/\x{0441}/smg;
  $str =~ s/&c_t;/\x{0442}/smg;
  $str =~ s/&c_u;/\x{0443}/smg;
  $str =~ s/&c_zh;/\x{0436}/smg;
  $str =~ s/&c_v;/\x{0432}/smg;
  $str =~ s/&c_mol;/\x{044c}/smg;
  $str =~ s/&c_y;/\x{044b}/smg;
  $str =~ s/&c_z;/\x{0437}/smg;
  $str =~ s/&c_sh;/\x{0448}/smg;
  $str =~ s/&c_e;/\x{044d}/smg;
  $str =~ s/&c_shch;/\x{0449}/smg;
  $str =~ s/&c_ch;/\x{0447}/smg;
  $str =~ s/&c_malmol;/\x{044a}/smg;

  $str =~ s/&c_jo;/\x{0451}/smg;
  $str =~ s/&c_w;/\x{045E}/smg;
  $str =~ s/&c_ib;/\x{0456}/smg;
  $str =~ s/&c_gu;/\x{0491}/smg;
  $str =~ s/&c_jeu;/\x{0454}/smg;
  $str =~ s/&c_ji;/\x{0457}/smg;

  # <!-- chehhaj, slovakaj kaj polaj -->
  $str =~ s/&Ccaron;/\x{010c}/g;
  $str =~ s/&ccaron;/\x{010d}/smg;
  $str =~ s/&Scaron;/\x{0160}/g;
  $str =~ s/&scaron;/\x{0161}/g;
  $str =~ s/&Rcaron;/\x{0158}/g;
  $str =~ s/&rcaron;/\x{0159}/g;
  $str =~ s/&Yacute;/\x{00dd}/g;
  $str =~ s/&yacute;/\x{00fd}/g;
  $str =~ s/&Zcaron;/\x{017d}/g;
  $str =~ s/&zcaron;/\x{017e}/g;
  $str =~ s/&Zdot;/\x{017b}/g;
  $str =~ s/&zdot;/\x{017c}/g;
  $str =~ s/&Ncaron;/\x{0147}/g;
  $str =~ s/&ncaron;/\x{0148}/g;
  $str =~ s/&Ecaron;/\x{011a}/g;
  $str =~ s/&ecaron;/\x{011b}/g;
  $str =~ s/&Dcaron;/\x{010e}/g;
  $str =~ s/&dcaron;/\x{010f}/g;
  $str =~ s/&Tcaron;/\x{0164}/g;
  $str =~ s/&tcaron;/\x{0165}/g;
  $str =~ s/&Uring ;/\x{016e}/g;
  $str =~ s/&uring ;/\x{016f}/g;

  $str =~ s/&Lacute;/\x{0139}/g;
  $str =~ s/&lacute;/\x{013a}/g;
  $str =~ s/&Lcaron;/\x{013d}/g;
  $str =~ s/&lcaron;/\x{013e}/g;
  $str =~ s/&Racute;/\x{0154}/g;
  $str =~ s/&racute;/\x{0155}/g;

  $str =~ s/&Aogonek;/\x{0104}/g;
  $str =~ s/&aogonek;/\x{0105}/g;
  $str =~ s/&Lstroke;/\x{0141}/smg;
  $str =~ s/&lstroke;/\x{0142}/smg;
  $str =~ s/&Eogonek;/\x{0118}/g;
  $str =~ s/&eogonek;/\x{0119}/g;
  $str =~ s/&Cacute;/\x{0106}/g;
  $str =~ s/&cacute;/\x{0107}/g;
  $str =~ s/&Nacute;/\x{0143}/g;
  $str =~ s/&nacute;/\x{0144}/g;
  $str =~ s/&Sacute;/\x{015a}/g;
  $str =~ s/&sacute;/\x{015b}/g;
  $str =~ s/&Zacute;/\x{0179}/g;
  $str =~ s/&zacute;/\x{017a}/g;

  $str =~ s/&alef;/\x{05d0}/g;
  $str =~ s/&bet;/\x{05d1}/g;
  $str =~ s/&gimel;/\x{05d2}/g;
  $str =~ s/&dalet;/\x{05d3}/g;
  $str =~ s/&he;/\x{05d4}/g;
  $str =~ s/&vav;/\x{05d5}/g;
  $str =~ s/&zayin;/\x{05d6}/g;
  $str =~ s/&het;/\x{05d7}/g;
  $str =~ s/&tet;/\x{05d8}/g;
  $str =~ s/&yod;/\x{05d9}/g;
  $str =~ s/&fkaf;/\x{05da}/g;
  $str =~ s/&kaf;/\x{05db}/g;
  $str =~ s/&lamed;/\x{05dc}/g;
  $str =~ s/&fmem;/\x{05dd}/g;
  $str =~ s/&mem;/\x{05de}/g;
  $str =~ s/&fnun;/\x{05df}/g;
  $str =~ s/&nun;/\x{05e0}/g;
  $str =~ s/&samekh;/\x{05e1}/g;
  $str =~ s/&ayin;/\x{05e2}/g;
  $str =~ s/&fpe;/\x{05e3}/g;
  $str =~ s/&pe;/\x{05e4}/g;
  $str =~ s/&ftsadi;/\x{05e5}/g;
  $str =~ s/&tsadi;/\x{05e6}/g;
  $str =~ s/&qof;/\x{05e7}/g;
  $str =~ s/&resh;/\x{05e8}/g;
  $str =~ s/&shin;/\x{05e9}/g;
  $str =~ s/&tav;/\x{05ea}/g;

  # <!-- hungaraj -->

#  # <!-- evitu, char shajne ne launormaj liternomoj -->
#  $str =~ s/\x{0150}/&Odacute;/g;
#  $str =~ s/\x{0151}/&odacute;/g;
#  $str =~ s/\x{0170}/&Udacute;/g;
#  $str =~ s/\x{0171}/&udacute;/g;

  # <!-- uzu tiujn anstataue -->
  $str =~ s/&Odblac;/\x{0150}/g;
  $str =~ s/&odblac;/\x{0151}/g;
  $str =~ s/&Udblac;/\x{0170}/g;
  $str =~ s/&udblac;/\x{0171}/g;

  # <!-- latvaj -->
#  $str =~ s/\x{257;}/&amacro;/g;
#  $str =~ s/\x{#275}/&emacr;/g;
#  $str =~ s/\x{291;}/&gcommaaccen;/g;
#  $str =~ s/\x{299;}/&imacro;/g;
#  $str =~ s/\x{311;}/&kcommaaccen;/g;
#  $str =~ s/\x{#316}/&lcommaacce;/g;
#  $str =~ s/\x{326;}/&ncommaaccen;/g;
#  $str =~ s/\x{333;}/&omacro;/g;
#  $str =~ s/\x{343;}/&rcommaaccen;/g;
#  $str =~ s/\x{363;}/&umacro;/g;
#
#  $str =~ s/\x{#256}/&Amacr;/g;
#  $str =~ s/\x{#274}/&Emacr;/g;
#  $str =~ s/\x{#290}/&Gcommaacce;/g;
#  $str =~ s/\x{#298}/&Imacr;/g;
#  $str =~ s/\x{#310}/&Kcommaacce;/g;
#  $str =~ s/\x{#315}/&Lcommaacce;/g;
#  $str =~ s/\x{#325}/&Ncommaacce;/g;
#  $str =~ s/\x{#332}/&Omacr;/g;
#  $str =~ s/\x{#342}/&Rcommaacce;/g;
#  $str =~ s/\x{#362}/&Umacr;/g;

  # <!-- kimraj -->
  $str =~ s/&Ycirc;/\x{0176}/g;
  $str =~ s/&ycirc;/\x{0177}/g;
  $str =~ s/&Wgrave;/\x{1e80}/g;
  $str =~ s/&wgrave;/\x{1e81}/g;
  $str =~ s/&Wacute;/\x{1e82}/g;
  $str =~ s/&wacute;/\x{1e83}/g;
  $str =~ s/&Wuml;/\x{1e84}/g;
  $str =~ s/&wuml;/\x{1e85}/g;
  $str =~ s/&Ygrave;/\x{1ef2}/g;
  $str =~ s/&ygrave;/\x{1ef3}/g;
  $str =~ s/&Wcirc;/\x{0174}/g;
  $str =~ s/&wcirc;/\x{0175}/g;
  $str =~ s/&Yuml;/\x{0178}/g;
  $str =~ s/&yuml;/\x{00ff}/g;


  # <!-- arabaj/persaj -->
  $str =~ s/&a_komo;/\x{060C}/g;
  $str =~ s/&a_punktokomo;/\x{061B}/g;
  $str =~ s/&a_demando;/\x{061F}/g;
  $str =~ s/&a_hamza;/\x{0621}/g;
  $str =~ s/&a_A_madda;/\x{0622}/g;
  $str =~ s/&a_A_hamza_sure;/\x{0623}/g;
  $str =~ s/&a_w_hamza;/\x{0624}/g;
  $str =~ s/&a_A_hamza_sube;/\x{0625}/g;
  $str =~ s/&a_y_hamza;/\x{0626}/g;
  $str =~ s/&a_A;/\x{0627}/g;
  $str =~ s/&a_b;/\x{0628}/g;
  $str =~ s/&a_t_marbuta;/\x{0629}/g;
  $str =~ s/&a_t;/\x{062A}/g;
  $str =~ s/&a_th;/\x{062B}/g;
  $str =~ s/&a_j;/\x{062C}/g;
  $str =~ s/&a_H;/\x{062D}/g;
  $str =~ s/&a_kh;/\x{062E}/g;
  $str =~ s/&a_d;/\x{062F}/g;
  $str =~ s/&a_dh;/\x{0630}/g;
  $str =~ s/&a_r;/\x{0631}/g;
  $str =~ s/&a_z;/\x{0632}/g;
  $str =~ s/&a_s;/\x{0633}/g;
  $str =~ s/&a_sh;/\x{0634}/g;
  $str =~ s/&a_S;/\x{0635}/g;
  $str =~ s/&a_D;/\x{0636}/g;
  $str =~ s/&a_T;/\x{0637}/g;
  $str =~ s/&a_Z;/\x{0638}/g;
  $str =~ s/&a_ayn;/\x{0639}/g;
  $str =~ s/&a_gh;/\x{063A}/g;
  $str =~ s/&a_tatwil;/\x{0640}/g;
  $str =~ s/&a_f;/\x{0641}/g;
  $str =~ s/&a_q;/\x{0642}/g;
  $str =~ s/&a_k;/\x{0643}/g;
  $str =~ s/&a_l;/\x{0644}/g;
  $str =~ s/&a_m;/\x{0645}/g;
  $str =~ s/&a_n;/\x{0646}/g;
  $str =~ s/&a_h;/\x{0647}/g;
  $str =~ s/&a_w;/\x{0648}/g;
  $str =~ s/&a_A_maqsura;/\x{0649}/g;
  $str =~ s/&a_y;/\x{064A}/g;
  $str =~ s/&a_fathatan;/\x{064B}/g;
  $str =~ s/&a_dammatan;/\x{064C}/g;
  $str =~ s/&a_kasratan;/\x{064D}/g;
  $str =~ s/&a_fatha;/\x{064E}/g;
  $str =~ s/&a_damma;/\x{064F}/g;
  $str =~ s/&a_kasra;/\x{0650}/g;
  $str =~ s/&a_shadda;/\x{0651}/g;
  $str =~ s/&a_sukun;/\x{0652}/g;
  $str =~ s/&a_madda_sure;/\x{0653}/g;
  $str =~ s/&a_hamza_sure;/\x{0654}/g;
  $str =~ s/&a_hamza_sube;/\x{0655}/g;
  $str =~ s/&a_A_sube;/\x{0656}/g;
  $str =~ s/&a_0;/\x{0660}/g;
  $str =~ s/&a_1;/\x{0661}/g;
  $str =~ s/&a_2;/\x{0662}/g;
  $str =~ s/&a_3;/\x{0663}/g;
  $str =~ s/&a_4;/\x{0664}/g;
  $str =~ s/&a_5;/\x{0665}/g;
  $str =~ s/&a_6;/\x{0666}/g;
  $str =~ s/&a_7;/\x{0667}/g;
  $str =~ s/&a_8;/\x{0668}/g;
  $str =~ s/&a_9;/\x{0669}/g;
  $str =~ s/&a_procento;/\x{066A}/g;
  $str =~ s/&a_dekumakomo;/\x{066B}/g;
  $str =~ s/&a_milumakomo;/\x{066C}/g;
  $str =~ s/&a_asterisko;/\x{066D}/g;
  $str =~ s/&a_A_sure;/\x{0670}/g;
  $str =~ s/&a_A_wasla;/\x{0671}/g;
  $str =~ s/&f_p;/\x{067E}/g;
  $str =~ s/&f_ch;/\x{0686}/g;
  $str =~ s/&f_zh;/\x{0698}/g;
  $str =~ s/&f_k;/\x{06A9}/g;
  $str =~ s/&f_g;/\x{06AF}/g;
  $str =~ s/&u_hy;/\x{06C0}/g;
  $str =~ s/&f_y;/\x{06CC}/g;
  $str =~ s/&f_0;/\x{06F0}/g;
  $str =~ s/&f_1;/\x{06F1}/g;
  $str =~ s/&f_2;/\x{06F2}/g;
  $str =~ s/&f_3;/\x{06F3}/g;
  $str =~ s/&f_4;/\x{06F4}/g;
  $str =~ s/&f_5;/\x{06F5}/g;
  $str =~ s/&f_6;/\x{06F6}/g;
  $str =~ s/&f_7;/\x{06F7}/g;
  $str =~ s/&f_8;/\x{06F8}/g;
  $str =~ s/&f_9;/\x{06F9}/g;
  $str =~ s/&a_fatha_A;/\x{064E}\x{0627}/g;
  $str =~ s/&a_kasra_y;/\x{0650}\x{064A}/g;
  $str =~ s/&a_damma_w;/\x{064F}\x{0648}/g;

  # <!-- formatsignoj -->
  $str =~ s/&zwnj;/\x{200C}/g;
  $str =~ s/&zwj;/\x{200D}/g;
  $str =~ s/&lrm;/\x{200E}/g;
  $str =~ s/&rlm;/\x{200F}/g;
  $str =~ s/&lre;/\x{202A}/g;
  $str =~ s/&rle;/\x{202B}/g;
  $str =~ s/&pdf;/\x{202C}/g;
  $str =~ s/&lro;/\x{202D}/g;
  $str =~ s/&rlo;/\x{202E}/g;


  $str =~ s/&amp;/&/g;

  delete $HTML::Entities::entity2char{quot};
  delete $HTML::Entities::entity2char{lt};
  delete $HTML::Entities::entity2char{gt};
  $str = HTML::Entities::decode_entities($str);
#  print "encode -> ".Encode::encode($enc, $str)."\n";
  return Encode::encode($enc, $str);
}
    
######################################################################

1;

