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

public class BretonCollator extends RuleBasedCollator {

    static final String BretonSortRules = " = '|' < a,A < b,B < ch,cH,Ch,CH < c'h,c'H,C'h,C'H < d,D < e,E < f,F < g,G < h,H < i,I < j,J < k,K < l,L < m,M < n,N,q,Q < o,O < p,P < r,R < s,S < t,T < u,U,\u00f9,\u00d9,\u00fc,\u00dc < v,V < w,W < x,X < y,Y < z,Z";

    public BretonCollator() throws ParseException {
	super(BretonSortRules);
    }
}
