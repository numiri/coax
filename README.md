# coax
Coax is a math-aware pencil & paper replacement for doing algebra exercises.
 
Here's a video demo of the app in action.  http://tessm.modstein.com:9089/snguyen/web/ours/html/demo.mp4

Until I figure out how to use github properly, you can get the code here http://tessm.modstein.com:9089/snguyen/web/ours/html/coax-0.8.tar

Handwriting recognizer:  We use a 3rd party handwriting engine from Mathpix and you will need a key.  You can use mine for free on a trial basis, or get one from Mathpix (they charge about .005usd per web call).

Licensing addendum:
You may use this software in accordance of the GPL license.  In addition, you must reserve a square area on the screen  the size of max( 1 cm^2, 2% of screen size ) for a link devoted to math education
<a href=[to-be-determined.html]><img src=[to-be-determined.png]></a>

# background
Coax grew out of KinderCalculus https://en.wikiversity.org/wiki/KinderCalculus, which teaches Calculus to K-6 students.  Surprisingly, the first hurdle for 5-7 year olds learning algebra was not the math concepts, but the mental load used to re-copy equations at every algebraic step.  A 1st-grader can understand the idea of "solve for x" as gathering all the x's together and isolating it.  Aside from proper algebraic massaging, the actual mechanics of going from one step to the next requires penmanship strategy, such as re-copying an equation while remembering to make room for the x terms to be near each other.  A mistake in executing this strategy causes a lot of re-write and frustration -- this penmanship strategy is an exercise in penmanship, NOT abstract ideas.
<pre>
For example, let's solve for x by first gathering x terms: 
(1)      6 + 4x = -3 - 5x + 2y   (given)
(2)      6 + 4x + 5x = -3 + 2y   (desired)

With the burden of pencil and paper, a 1st grade child must exerts mental effort either by 
   (a) copy "6 + 4x __ = -3 -5x + 2y" to a new line, while remembering to leave the blank space.  
       this is a lot of writing which interrupts the train of thought.
or (b) re-use the existing line by erasing 6 + 4x and shift it left to make room.  
       this requires memorizing "6 + 4x" because it has been erased.  again, interrupting the chain of thought.

Coax allows the child to drag "6 + 4x" left to make room.  
   (1)  <--( 6 + 4x ) = -3 - 5x + 2y                  (2) 6 + 4x  _   = -3 - 5x + 2y   
                                                                   ^         |
        drag 6 + 4x to the left to                                 |         | 
        make space next to "="                                     +---------+
                                                         drag 5x across the " = "
</pre>
No penmanship needed.  As it turns out, abstract ideas are not the first barrier to algebra for young children -- it's penmanship!

# system layout
<pre>
                                                   browser  <--> app server <--> database.
                                                       |             |
The system layout is typical for a web app:            |        +----+-----+     
                         with 2 extensions:            |        |          |
                                                       handwriting     computer algebra
                 (lines show communications)           recognizer(s)   system (maxima)
</pre>
The handwriting recognizer is the trickiest part, so we rely on commercial systems.  Depending on the recognizer, it could be part of the app server, or a commercial web service elsewhere.  See end of document for a comparison of existing recognizers.

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
# dangling code:
At one point Coax was connected with the Freeciv game, and the ActiveMath tutoring system.  Alas, we lost this code due to a harddrive mishap-- I'm very sad about it.  You may still see references to that connection, eg. in the URL with http://.../index.jsp?mode=standalone (no freeciv, no activemath).  mode=connected would mean Coax is talking to Freeciv.  Additionally, the gui was intended to be bundled as a native mobile app via PhoneGap.  We have not kept up with that but references to these platforms may still exist as "noid" and "napl".

# directory
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
                       v         :                                                            ---+
                    WEB-INF/     :   cross-files.txt                      main/java/com/coax     |
                    settings     :        |              pom.xml  src --  /common/Cli/*java      |
             soft   _tree.xml    :        |                    |   |                             |
             link   login.jsp    :       doc                   +---+                             |
         +--jsp <-- index.jsp--+ :        |                      |                               |
   html -|                     | :        |                      |                               |
         |-- ours --+          | :        |                +-- common                            |
 +====+  |          |          | V   +--------+            |-- database -- schema.sql            |
 | js | -+          |-- web -- gui --|  trunk |-- server --|-- theirs-+--lib -- activemath-*.jar |
 +====+    theirs --+           |    +--------+            +-- dao    |  CIT    thirdparty-*.jar |  coax
             |                  |                                |    +--tomcat                  |  code
             |                (limbo code)                       |                               |  base
             +- jquery        noid (native android)            +---+                             |
                mathjax       napl (native ios)                |   |                             |
                ...                                      pom.xml  src -- main/java/com/coax      |
                                                                         /db/dao/*java           |
                                                                                              ---+
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

# installation
pre-requisite: mysql, tomcat 6 or 8, basic unix knowledge (env variables, soft links), root privileges (for mysql)

tar ball
--------
<pre>
env variables -- create these variables:   $cat = tomcat home
,  $trunk = ~/coax-src/coax/trunk (coax-src is only needed if you run multiple versions of coax)

> mkdir ~/coax-src                          (multiple versions of the source can live here)
> mkdir ~/coax-src/coax-XX                  (XX = version number)
> tar   -xzf coax-XX.tar.gz                 (trunk dir created)
> mv   trunk ~/coax-src/coax                (now we have ~/coax-src/coax-XX/trunk)
> ln -s ~/coax-src/coax-xx ~/coax-src/coax  (switch to other coax versions using soft link)
</pre>

# Java code
Install tomcat & copy the xml files to your tomcat install (configCmd.xml, web.xml, conf/server.xml, conf/web.xml).  In my env, tomcat lives in the coder's home directory and listens on the port specifed in web.xml.
<pre>
> ln -s ~/coax-src/coax/trunk/gui $cat/webapps/ROOT/jdoe  (jdoe is coder's name)
to build the java code, 
> cd to the 2 directories dao or common where pom.xml is.
> apt-get install mvn ?
> mvn install
> cd target
> cp coax-common-0.0.1-SNAPSHOT.jar $cat/lib
> cp coax-db-0.0.1-SNAPSHOT.jar     $cat/lib
</pre>

# database
<pre>
if mysql is not installed
> yum install mysql
> yum install mysql-server
> service mysqld start

import the database as follows
> mysql --user=root --password=xxx
mysql> create database coax;
> mysql --user=root --password=xxx coax < coax.sql  (coax.sql is in trunk/server/database)
mysql> grant all on coax.* to 'root'@'localhost';
mysql> grant all on coax.* to 'root'@'%';  (not sure if this is needed)
</pre>

# .bashrc
some useful aliases and env's are
<pre>
export cat=~/big/app/tomcat6
export trunk=~/coax-src/coax/trunk
export CLASSPATH=.:"$cat/lib/*":$cat/lib:$trunk/src/main/java/com/coax/db/dao:$trunk/src/main/java/com/coax/db/dto:$cat/lib/tomcat-juli.jar

alias cdtrunk='cd $trunk'
alias cdjs='cd $trunk/gui/web/ours/js'
alias cdjsp='cd $trunk/gui/web/ours/jsp'
alias cdcommon='cd $trunk/server/common'
alias cdcli='cd $trunk/server/common/src/main/java/com/coax/common/Cli'
alias cddao='cd $trunk/server/dao/src/main/java/com/coax/db/dao' 
alias cdjasp='cd ~/big/app/tomcat6/work/Catalina/localhost/_/org/apache/jsp/jdoe/web/ours/jsp' (for debugging jsp)
alias cpdbjar='cp $trunk/server/dao/target/coax-db-0.0.1-SNAPSHOT.jar $cat/lib'
alias cpccjar='cp $trunk/server/common/target/coax-common-0.0.1-SNAPSHOT.jar $cat/lib'
</pre>
app login:  admin/wyoming

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
