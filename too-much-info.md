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

# technical docs
We tried to document where features get complicated.  I wish we had better docs for stroke Groupings, Settings.  Where possible, ascii art is the preferred form of drawing.  We have 3 main types of docs:  static (data structures), dynamic (stack trace), and function input/output.
<pre>
gui-layout      : static  editor screen html nodes
rex-stack-trace : dynamic call stack for recognizer sequence
cross-files.txt : input/output data exchanges between key functions.  also has data structures and stack traces.
                : This files become out of date fast because details are so fluid, so keep it up to date.
style-guide     : see Rex.js for examples to follow.  There are 2 main rules:  
                : 1.  keep lines to under 80 characters, and 
                : 2.  don't waste screen real estate w/ nearly empty lines like " } "
steps           : call stack for creating/deleting Steps in the History panel
open & organize tree: call stack for hierarchical node trees
sharing-fiz-guz : google docs -> tess-4 -> specs -> specs-oiz-graph -> sharing-fiz-guz.txt
</pre>
I must apologize for the chaotic-ness of the code.  It has been touched by many people, has non-English comments in a few places, and had poorly enforced style guide.  I am to blame for the poor management.

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

# recognizers
<pre>
CIT-Draculae - open source, but very old.  CIT does single characters and Draculae uses 
.              CIT to read the entire expression.  Draculae returns strange hbox & vbox latex tags.
Mathpix      - Proprietary but accurate.  Affordable at half-penny per web service call.  
.              Based on Harvard's neural network.
Microsoft    - MIP (math input panel).  free but poor accuracy on some basic symbols, like a stand-alone "2"
MyScript     - Proprietary but accurate.  As of 2015, it is very expensive and difficult to get a trial key.
Seshat       - open source.  good accuracy for single characters & simple expressons,
.              but slow for more complex expressions.
</pre>
As a compromise, we use a Seshat-Mathpix combination.  Mathpix is accurate, but since we try to recognise each stroke as it's written so it can be grouped into draggable units like "cos", Mathpix cost can quickly add up.  We use Seshat for single strokes & groupings.  The file Classifier.js and Rex.js implements these strategies.

# dangling code:
At one point Coax was connected with the Freeciv game, and the ActiveMath tutoring system.  Alas, we lost this code due to a harddrive mishap-- I'm very sad about it.  You may still see references to that connection, eg. in the URL with http://.../index.jsp?mode=standalone (no freeciv, no activemath).  mode=connected would mean Coax is talking to Freeciv.  Additionally, the gui was intended to be bundled as a native mobile app via PhoneGap.  We have not kept up with that but references to these platforms may still exist as "noid" and "napl".

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
