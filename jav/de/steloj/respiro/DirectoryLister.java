//  #**************************************************************************
//  #
//  #    $Id$
//  #
//  #    Copyright (C) 2006-{year}  Wolfram Diestel
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

import java.io.*;

public class DirectoryLister {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		final String pathname = args[0];
		final String filterstr = args[1];
		
		File path = new File(pathname);
		FilenameFilter filter = new FilenameFilter() {
			public boolean accept(File dir, String name) {
				return name.matches(filterstr);
			}
		};
		
		File[] files = path.listFiles(filter);
		
		System.out.println("<?xml version=\"1.0\"?>");
		System.out.println("<dir name=\""+pathname+"\" filter=\""+filterstr+"\">");
		for (int i=0; i<files.length; i++) {
			File file = files[i];
			String size;
			if (file.length()<1024) {
				size=""+file.length()+" B";
			} else if (file.length()<1024*1024) {
				size=""+file.length()/1024+" KB";
			} else {
				double mb=(double)Math.round((double)file.length()/1024/1024*10)/10;
				size=""+mb+" MB";
			}
			System.out.println("  <file name=\""+file.getName()+"\" size=\""+size+"\"/>"); 
		}
		System.out.println("</dir>");
	}

}
