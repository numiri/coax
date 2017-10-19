# directories
trunk is the center directory.  the bulk of the code is in the "js" directory.
<pre>
                                                                                              ---+
 catalina.sh -- bin --+                       +- configCmd.xml (paths to binaries cit,..)        |
catalina.out - logs   |-- ~/big/app/tomcat6 --|  config.xml    (db logins)                       |
   coax*.jar -- lib --+          |            +- conf          -- server.xml (ports)             |  tomcat 
                          webapps/ROOT/jdoe   |                   web.xml (tomcat configs)       |
                       ......... : ...........+- settings_tree.xml                            ---+
                       :         : soft
                       :         : link
                       :         :                                                            ---+
                       :         :   cross-files.txt                      main/java/com/coax     |
                       V         :        |              pom.xml  src --  /common/Cli/*java      |
             soft     (*)        :        |                    |   |                             |
             link   login.jsp    :       doc                   +---+                             |
         +--jsp <-- index.jsp--+ :        |                      |                               |
   html -|                     | :        |                      |                               |
         |-- ours --+          | :        |                +-- common                            |
 +====+  |          |          | V   +--------+            |-- database -- schema.sql            |
 | js | -+          |-- web -- gui --|  trunk |-- server --|                                     |
 +====+    theirs --+           |    +--------+            +-- dao                               |  coax
             |                  |                                |                               |  code
             |                (limbo code)                       |                               |  base
             +- jquery        noid (native android)            +---+                             |
                mathjax       napl (native ios)                |   |                             |
                ...                                      pom.xml  src -- main/java/com/coax      |
                                                                         /db/dao/*java           |
                                                                                              ---+
(*) sub-directory WEB-INF/settings_tree.xml
</pre>

# code files
Since this is a rich GUI app, 80% of the code is in Javascript.  The remainder is 15% Java, and 5% SQL.  
Some key files are:
<pre>
Editor.Events.js: The biggest file.  Deals with different types of touches like drawing, dragging, etc.
                : Coordinates Submit action and parses recognizer & algebra responses.
History.js      : This file deals w/ data-structures for the sequence of algebraic steps (called a history).
AutoGroup.js    : Group strokes like c-o-s together as a single draggable unit "cos"
Formula.js      : cooperates w/ AutoGroup.js, open-tree.js, and History.js
Rex.js          : Adapter pattern to swap out handwriting recognizers
Classifier.js   : recognizer for single symbols.
support screens : Settings.js -- for app settings
                : author-xiz.js -- for creating exercises
                : jbuild-shared.js -- for admins to control who has access to which part of the exercise tree.
                : open-tree.js -- the modal dialogue to navigate the tree of exercises.
</pre>


# vocabulary
here are some abbreviations used throughout the code to keep lines short
<pre>
syq   = system of equations
fraz  = a math expression, pronounced "phrase"
rex   = recognition, recognizer, recognize
corx  = mathematical correctness.  refers to the red/green lights in each step.
lec   = left  upper corner of a bounding box (= worldMinPosition?)
ric   = right lower corner of a bounding box (= worldMaxPosition?)
align = recognition of an expression by perceiving the correct placement (alignment) of characters
</pre>
