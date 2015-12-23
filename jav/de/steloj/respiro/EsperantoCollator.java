//  #**************************************************************************
//  #
//  #    $Id$
//  #
//  #    Copyright (C) 2013-{year}  Wolfram Diestel
//  #
//  #    This program is free software; you can redistribute it and/or modify
//  #    it under the terms of the GNU General Public License as published by
//  #    the Free Software Foundation; either version 2 of the License, or
//  #    (at your option) any later version.
//  #
//  #    This program is distributed in the hope that it will be useful,
//  #    but WITHOUT ANY WARRANTY; without even the implied warranty of
//  #    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  #    GNU General Public License for more details.
//  #
//  #    You should have received a copy of the GNU General Public License
//  #    along with this program; if not, write to the Free Software
//  #    Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
//  #
//  #    Send comments and bug fixes to diestel@steloj.de
//  #
//  #**************************************************************************/

package de.steloj.respiro;

import java.text.RuleBasedCollator;
import java.text.ParseException;

public class EsperantoCollator extends RuleBasedCollator {

       static final String EsperantoSortRules = " = '|' < a,A < b,B < c,C < \u0109,\u0108 < d,D < e,E < f,F < g,G < \u011d,\u011c < h,H < \u0125,\u0124 < i,I < j,J < \u0135,\u0134 < k,K < l,L < m,M < n,N < o,O < p,P < r,R < s,S < \u015d,\u015c < t,T < u,U < \u016d,\u016c < v,V < z,Z";

    public EsperantoCollator() throws ParseException {
	super(EsperantoSortRules);
    }
}
