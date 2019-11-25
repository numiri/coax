package com.coax.common.Cli;

 class Probability {
String variable;
double prob;

 Probability(String variable, double prob) {
	super();
	this.variable = variable;
	this.prob = prob;
}

public double getProb() {
	return prob;
}

public void setProb(float prob) {
	this.prob = prob;
}

public String getVariable() {
	return variable;
}

public void setVariable(String variable) {
	this.variable = variable;
}
}
