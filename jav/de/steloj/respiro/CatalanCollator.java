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

public class CatalanCollator extends RuleBasedCollator {

    static final String CatalanSortRules = " = '|' < a,A,\u00e0,\u00c0 < b,B < c,C,\u00e7,\u00c7 < d,D < e,E,\u00e9,\u00c9,\u00e8,\u00c8 < f,F < g,G < h,H < i,I,\u00ed,\u00cd,\u00ef,\u00cf < j,J < k,K < l,L,l\u00b7,L\u00b7 < m,M < n,N < o,O,\u00f3,\u00d3,\u00f2,\u00d2 < p,P < q,Q < r,R < s,S < t,T < u,U,\u00fa,\u00da,\u00fc,\u00dc < v,V < w,W < x,X < y,Y < z,Z";

    public CatalanCollator() throws ParseException {
	super(CatalanSortRules);
    }
}
