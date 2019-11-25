package com.coax.common.Cli;

import java.util.Comparator;

/**
 * TODO Put here a description of what this class does.
 *
 * @author phamvan.
 *         Created Dec 3, 2011.
 */
 class IdComparator implements Comparator<Latex> {

public int compare(Latex item1, Latex item2) {
	
	return item1.getId()-item2.getId();
}
}
