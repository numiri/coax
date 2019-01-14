# installation

pre-requisites
--------------
server:  you will need a Linux machine like Ubuntu-16 capable of mysql, tomcat 6 (and jdk 1.8).  You also need mid-level unix knowledge (env variables, soft links), and root privileges (for mysql, access to /usr/local).  
1.  install mysql with "apt-get install mysql-server".  also make sure mysql-common is there "dpkg --get-selections | grep mysql"
2.  tomcat is included in our tar ball from the readme.md page.  
3.  You will also need JDK 1.8 from Oracle's website or here http://tessm.modstein.com:9090/public/jdk-8u25-linux-x64.tar.gz (160MB).

client:  this app runs on Chrome on Android, iOS, and Windows.  Firefox and Opera might work too.  We <b>strongly</b> recommend using a stylus on a tablet.  Fingers work ok on a Windows touch screen.

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

tar ball
--------
<pre>
the tar structure is as follows:

               +- coax-trunk-yymmdd.tar.gz   (unpacks as trunk)
  coax-XX.tar -|  coax-db-yymmdd.sql
  (coax-XX)    +- coax-tomcat6-yymmdd.tar.gz (unpacks as tomcat6)

unpack the above packages into the following dir structure.  create the directories as needed.

     +- big/app/tomcat6
  ~ -|  (the sql file is used in the database section below)
     +- coax-src/coax-XX/trunk
   
create a softlink that can point to multiple versions for later
> ln -s ~/coax-src/coax-xx ~/coax-src/coax  
</pre>

tomcat
------
tomcat lives in ~/big/app/tomcat6 (env $cat) and listens on the port specified in server.xml.
<pre>
> ln -s ~/coax-src/coax/trunk/gui $cat/webapps/ROOT/jdoe  (jdoe is coder's username)
> cd $cat; cd conf/server.xml                 # find 3 unused ports and set them at these xml tags
                                              #   Connector port="xxx" protocol="HTTP/1.1" ... 
                                              #   Connector port="xxx" protocol="AJP/1.3"
                                              #   Server    port="xxx" shutdown=...
> vi config.xml                               # set the mysql user login & password
> vi configCmd.xml                            # set <workpath>
> rm settings_tree.xml                        #
> ln -s ~/coax-src/coax/trunk/gui/WEB-INF/settings_tree.xml settings_tree.xml
> cd $cat/lib; rm commons-pool-1.6.tar
> wget http://central.maven.org/maven2/commons-pool/commons-pool/1.4/commons-pool-1.4.jar
# commons-pool version must match common-dbcp version, which is 1.4.
# settings_tree.xml and commons-pool steps will be automated in the next release.
</pre>

Install Java JDK from Oracle's website and set JAVA_HOME appropriately in your .bashrc.  tomcat6/bin/catalina.sh uses JAVA_HOME and also sets its own CLASSPATH.  If you need to change the java code & compile it, you will need to set CLASSPATH in your .bashrc as shown below.

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
> mysql --user=root --password=xxx coax < coax-db-xxxxxx.sql  (sql file is in tar ball)
mysql> grant all on coax.* to 'root'@'localhost';
mysql> grant all on coax.* to 'root'@'%';  (not sure if this is needed)
</pre>
Be sure to set the database name, login, password in tomcat's config.xml.

seshat
------
seshat is the stage-1 handwriting recognizer.  A stage-1 recognizer is intended to recognize a few strokes at a time, mainly for grouping strokes into a single gui-draggable entity.  A stage-2 recognizer is intended for an entire  latex expression, intended for maxima to check the correctness of a completed math Step.  The stage-2 recognizer Mathpix is a web service call that does not require installation, except for a key string.  
<pre>
> apt-get install libboost-dev
> wget https://github.com/falvaro/seshat/archive/master.zip
> <unzip & cd to seshat>
> make                        # on Raspbian, I needed to increase swap to 2GB.  see /etc/dphys-swapfile
> cd Config; ln -s .. Config; # strange that this is needed on Raspbian OS.
> cd ..; mv seshat /usr/local; cd /usr/local/seshat/Config
</pre>

coding
------
This section is only needed if you want to modify the server side java code.  To build the java code, 
<pre>
> ln -s $cat /usr/local/tomcat6               # pom.xml hard codes /usr/local/tomcat6.  
                                              # edit pom.xml as appropriate or create this symbolic link.
> apt-get install maven                       # or download from maven.apache.org
> cd $cat/lib; wget http://central.maven.org/maven2/commons-pool/commons-pool/1.4/commons-pool-1.4.jar
</pre>
The final step is needed for running on raspbian OS on Raspberry Pi.  I will bundle it in a future release.  The essence of the problem is that Apache's commons-dbcp and commons-pool versions need to match.  If not, you may get the error "org.apache.commons.pool.impl.GenericObjectPool: method \<init\>()V not found"

here are the steps if you need to change the java code:
<pre>
> cd $trunk/server/common  (or the dao directory, depending on which code you're changing)
> mvn install
> cpccjar (or cpdbjar, if you're changing dao code)
> t6restart
</pre>
jsp's don't need explicit compilation.  Tomcat should automatically recompile for you, but try restarting tomcat if the new code doesn't take effect.  javascript doesn't need any compilation, of course.

run app
-------
Start tomcat with "t6start".  (mysql usually starts on boot.).  Point your browser to http://host:<port>/<user>/login.jsp. port is in tomcat6's server.xml file.  <user> is the home directory where you installed the app's java code.  login with demo1/alabama
