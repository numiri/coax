# installation

pre-requisites
--------------
server:  you will need a Linux machine like Ubuntu-16 capable of mysql, tomcat 6 (and jdk 1.8).  You also need basic unix knowledge (env variables, soft links), and root privileges (for mysql).  
1.  install mysql with apt-get.  
2.  tomcat is included in our tar ball from the readme.md page.  
3.  You will also need JDK 1.8 from Oracle's website or here http://tessm.modstein.com:9089/snguyen/public/jdk-8u25-linux-x64.tar.gz (160MB).

client:  this app runs on Chrome on Android, iOS, and Windows.  Firefox and Opera might work too.  We <b>strongly</b> recommend using a stylus on a tablet.  Fingers work ok on a Windows touch screen.

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

Java code
---------
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

database
--------
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

seshat
------
seshat is the stage 1 handwriting recognizer.  (the stage 2 recognizer is a webservice call that does not require installation, except for a key string.)
> apt-get install libboost-dev
> wget https://github.com/falvaro/seshat/archive/master.zip
> <unzip & cd to seshat>
> make
> (to be continued)

.bashrc
-------
some useful aliases and env's are
<pre>
export cat=~/big/app/tomcat6
export trunk=~/coax-src/coax/trunk
export CLASSPATH=.:"$cat/lib/*":$cat/lib:$cat/lib/tomcat-juli.jar
alias cdtrunk='cd $trunk'
alias cdjs='cd $trunk/gui/web/ours/js'
alias cdjsp='cd $trunk/gui/web/ours/jsp'
alias cdcommon='cd $trunk/server/common'
alias cdcli='cd $trunk/server/common/src/main/java/com/coax/common/Cli'
alias cddao='cd $trunk/server/dao/src/main/java/com/coax/db/dao' 
alias cdjasp='cd ~/big/app/tomcat6/work/Catalina/localhost/_/org/apache/jsp/jdoe/web/ours/jsp' (for debugging jsp)
alias cpdbjar='cp $trunk/server/dao/target/coax-db-0.0.1-SNAPSHOT.jar $cat/lib'
alias cpccjar='cp $trunk/server/common/target/coax-common-0.0.1-SNAPSHOT.jar $cat/lib'
alias t6start='$cat/bin/catalina.sh start'
alias t6stop='$cat/bin/catalina.sh stop'
alias t6restart='t6stop; t6start'
</pre>

coding
------
here are the steps if you need to change the java code:
<pre>
> cd $trunk/server/common  (or the dao directory, depending on which code you're changing)
> mvn install
> cpccjar (or cpdbjar, if you're changing dao code)
> t6restart
</pre>
jsp's don't need explicit compilation.  Tomcat should automatically recompile for you, but try restarting tomcat if the new code doesn't take effect.

javascript doesn't need any compilation, of course.
