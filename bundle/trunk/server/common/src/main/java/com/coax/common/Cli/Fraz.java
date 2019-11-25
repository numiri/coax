// see #doc-fraz.java
package com.coax.common.Cli;
import java.util.LinkedList;
public class Fraz {

// a Fraz represents one expression, not multiple expressions in a System.
// for that, you'd need a set of Fraz's.

public String fraz;
public String variable;
public boolean hasEqual;
public boolean hasAnyEqual;

    // public Fraz( String fraz, String variable ) { this.fraz = fraz; this.variable = variable; }

   public Fraz( String fraz, String variable ) {
   fraz     = fraz.replace("%2B", "+");
   this.fraz     = fraz; 
   this.variable = variable;
   hasEqual = fraz.contains("=");
   hasAnyEqual = fraz.contains(">") || fraz.contains("<");     } 

 }


