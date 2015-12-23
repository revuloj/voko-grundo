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

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.types.Parameter;
import org.apache.tools.ant.types.selectors.*;

import java.io.File;

/**
 * @author wolfram
 *
 */
public class DiffMaxFilesSelector extends BaseExtendSelector {
	int fileCount;
	int maxFiles;
	DifferentSelector diffSelector;
	
	public static final String TARGET_DIR = "targetdir";
    public static final String IGNORE_FILE_TIMES = "ignorefiletimes";
    public static final String IGNORE_CONTENTS = "ignorecontents";
    public static final String GRANULARITY = "granularity";
    public static final String MAX_FILES = "maxfiles";
	   	
	
	/**
	 * 
	 */
	public DiffMaxFilesSelector() {
		super();
		fileCount = 0;
		diffSelector = new DifferentSelector();
	}
	
	public void setParameters(Parameter[] parameters) {
		super.setParameters(parameters);
		
        for (int i = 0; i < parameters.length; i++) {
            String paramname = parameters[i].getName();
            if (TARGET_DIR.equalsIgnoreCase(paramname)) {
            	diffSelector.setTargetdir(new File(parameters[i].getValue()));
            } else if (IGNORE_FILE_TIMES.equalsIgnoreCase(paramname)) {
                diffSelector.setIgnoreFileTimes(parameters[i].getValue().equalsIgnoreCase("true"));
            } else if (IGNORE_CONTENTS.equalsIgnoreCase(paramname)) {
                diffSelector.setIgnoreContents(parameters[i].getValue().equalsIgnoreCase("true"));
            } else if (GRANULARITY.equalsIgnoreCase(paramname)) {
            	diffSelector.setGranularity(Integer.parseInt(parameters[i].getValue()));
            } else if (MAX_FILES.equalsIgnoreCase(paramname)) {
            	maxFiles = Integer.parseInt(parameters[i].getValue());
            }
        }
	}
	
    public boolean isSelected(File basedir, String filename,
            File file) throws BuildException {
    	if (fileCount>=maxFiles) return false;
    	else {
    		boolean selected = diffSelector.isSelected(basedir, filename, file);
    		if (selected) fileCount++;
    		
    		//System.err.println(""+fileCount);
    		
    		return selected;
    }
      

}


}


