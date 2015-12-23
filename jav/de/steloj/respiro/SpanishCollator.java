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

public class SpanishCollator extends RuleBasedCollator {

    static final String SpanishSortRules = 

	" = '|' < a,A,\u00e1,\u00c1 < b,B < c,C < ch,cH,Ch,CH < d,D < e,E,\u00e9,\u00c9 < f,F < g,G < h,H < i,I,\u00ed,\u00cd < j,J < k,K < l,L < ll,lL,Ll,LL < m,M < n,N < \u00f1,\u00d1 < o,O,\u00f3,\u00d3 < p,P < q,Q < r,R < s,S < t,T < u,U,\u00fa,\u00da,\u00fc,\u00dc < v,V < w,W < x,X < y,Y < z,Z";

    public SpanishCollator() throws ParseException {
	super(SpanishSortRules);
    }
}
