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

public class PersianCollator extends RuleBasedCollator {

    static final String PersianSortRules = 
	" = '|' = '!' = '.' = ':' = '(' = ')' = '[' = ']' = \u2026 = \u060c = \u061b = \u061f = \u0640 = \u200c = \u200d = \u064e = \u0650 = \u064f = \u064b = \u064d = \u064c = \u0651 = \u0652 = \u0653 = \u0654 = \u0655 = \u0670 = \u0656 < ' ' < \u06f0,\u0660 < \u06f1,\u0661 < \u06f2,\u0662 < \u06f3,\u0663 < \u06f4,\u0664 < \u06f5,\u0665 < \u06f6,\u0666 < \u06f7,\u0667 < \u06f8,\u0668 < \u06f9,\u0669 < \u0622 < \u0627,\u0671 < \u0621,\u0623,\u0625,\u0624,\u0626 < \u0628 < \u067e < \u062a < \u062b < \u062c < \u0686 < \u062d < \u062e < \u062f < \u0630 < \u0631 < \u0632 < \u0698 < \u0633 < \u0634 < \u0635 < \u0636 < \u0637 < \u0638 < \u0639 < \u063a < \u0641 < \u0642 < \u06a9,\u0643 < \u06af < \u0644 < \u0645 < \u0646 < \u0648 < \u0647,\u0629 < \u06cc,\u0649,\u064a & \u0622 = \u0627\u0653 & \u0623 = \u0627\u0654 & \u0624 = \u0648\u0654 & \u0625 = \u0627\u0655 & \u0626 = \u064a\u0654";
    public PersianCollator() throws ParseException {
	super(PersianSortRules);
    }
}
