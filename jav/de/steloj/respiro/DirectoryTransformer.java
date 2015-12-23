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


import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.File;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import javax.xml.transform.OutputKeys;


public class DirectoryTransformer {

	static boolean verbose = false;
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub

		int i=0;
		
		// options
		while (args[i].charAt(0)=='-') {
			if (args[0].equals("-v")) {
				verbose = true;
			}
			i++;
		}
		
		final String pathname = args[i];
		final String stylesheet = args[i+1];	
		final String outfilename = args[i+2];
		
		final String rootTag; 
		if (args.length>i+3)
			rootTag = args[i+3];
		else
			rootTag = "xml";
		
		try {
			transformDir(pathname,stylesheet,outfilename,rootTag);
		} catch (Exception e) {
			System.out.print(e);
		}
	}
	
	public static void transformDir(String pathname, String style, String outfilename, String rootTag) 
	throws TransformerException, TransformerConfigurationException, 
	FileNotFoundException, IOException
	{  
		// Prepare transformer
		TransformerFactory tFactory = TransformerFactory.newInstance();
		Transformer transformer = tFactory.newTransformer(
					new StreamSource(style));
		transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION,"yes");			
		
		File inpath = new File(pathname);
		FileOutputStream outfile = new FileOutputStream(outfilename);
		
		String start = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"+
			"<"+rootTag+">";
		String end = "</"+rootTag+">";
		
		StreamResult result = new StreamResult(outfile);
		outfile.write(start.getBytes());
		
		File[] files = inpath.listFiles();

		for (int i=0; i<files.length; i++) {
			File file = files[i];
			
			if (file.isFile()) {
				if (verbose) System.err.println(file.getName()+"...");
			
				transformer.transform(new StreamSource(file), 
						result);
			}
		}
		
		outfile.write(end.getBytes());
		outfile.flush();
		outfile.close();
	}

}
