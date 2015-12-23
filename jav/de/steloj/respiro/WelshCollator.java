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

public class WelshCollator extends RuleBasedCollator {

    static final String WelshSortRules = " = '|' < a,A < b,B < c,C < ch,cH,Ch,CH < d,D < e,E < f,F < ff,fF,Ff,FF < g,G < h,H < i,I < j,J < l,L < ll,lL,Ll,LL < m,M < n,N < o,O < p,P < ph,pH,Ph,PH < r,R < rh,rH,Rh,RH < s,S < t,T < th,tH,Th,TH < u,U < w,W,\u1e83,\u1e82,\u1e81,\u1e80,\u0175,\u0174,\u1e85,\u1e84 < y,Y,\u1ef3,\u1ef2,\u0177,\u0176,\u0178";

    public WelshCollator() throws ParseException {
	super(WelshSortRules);
    }
}
