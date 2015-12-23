/**
 * 
 */
package de.steloj.respiro;

import java.io.File;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.types.Parameter;
import org.apache.tools.ant.types.selectors.DateSelector;

/**
 * @author wolfram
 *
 */
public final class DateMaxFilesSelector extends DateSelector {
	int fileCount;
	int maxFiles;
	
	public static final String DATETIME = "datetime";
    public static final String MILLIS = "millis";
    public static final String WHEN = "when";
    public static final String PATTERN = "pattern";
    public static final String CHECK_DIRS = "checkdirs";
    public static final String GRANULARITY = "granularity";
    public static final String MAX_FILES = "maxfiles";

	/**
	 * 
	 */
	public DateMaxFilesSelector() {
		super();
		fileCount = 0;
	}
	
	public void setParameters(Parameter[] parameters) {
		//super.setParameters(parameters);
		
        for (int i = 0; i < parameters.length; i++) {
            String paramname = parameters[i].getName();
            if (DATETIME.equalsIgnoreCase(paramname)) {
            	setDatetime(parameters[i].getValue());
            } else if (MILLIS.equalsIgnoreCase(paramname)) {
                setMillis(Integer.parseInt(parameters[i].getValue()));
            } else if (WHEN.equalsIgnoreCase(paramname)) {
                TimeComparisons cmp = new TimeComparisons();
                cmp.setValue(parameters[i].getValue());
                setWhen(cmp);
            } else if (PATTERN.equalsIgnoreCase(paramname)) {
                setPattern(parameters[i].getValue());
            } else if (CHECK_DIRS.equalsIgnoreCase(paramname)) {
                setCheckdirs(parameters[i].getValue().equalsIgnoreCase("true"));
            } else if (GRANULARITY.equalsIgnoreCase(paramname)) {
            	setGranularity(Integer.parseInt(parameters[i].getValue()));
            } else if (MAX_FILES.equalsIgnoreCase(paramname)) {
            	maxFiles = Integer.parseInt(parameters[i].getValue());
            }
        }
	}
	

	/* (non-Javadoc)
	 * @see org.apache.tools.ant.types.selectors.BaseExtendSelector#isSelected(java.io.File, java.lang.String, java.io.File)
	 */
	public boolean isSelected(File basedir, String filename, File file)
			throws BuildException {
		// TODO Auto-generated method stub
    	if (fileCount>=maxFiles) return false;
    	else {
    		boolean selected = super.isSelected(basedir, filename, file);
    		if (selected) {
    			fileCount++;
    			//System.err.println(filename);
    		}
    		
    		//System.err.println(""+fileCount);
    		
    		return selected;
    	}
	}

}
