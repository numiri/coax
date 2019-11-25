package com.coax.common.Cli;

import java.util.Comparator;

 class ProbComparator   implements Comparator<Probability> {
	
	public int compare(Probability item1, Probability item2) {
		
		if(item1.getProb()>item2.getProb())
		{
			return -1;
		}
		if(item1.getProb()<item2.getProb())
		{
			return 1;
		}
		
		if(item1.getProb()==item2.getProb())
		{
			return 0;
		}
		return 0;
	}
}
