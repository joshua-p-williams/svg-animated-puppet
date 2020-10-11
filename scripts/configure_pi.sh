#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
cd $DIR

# Redirect port 80 to port 8080
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080

# Create the service
echo "#!/bin/sh
#/etc/init.d/puppet-service
export PATH=\$PATH:/usr/local/bin
export NODE_PATH=\$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
start)
exec forever --sourceDir=$DIR -p $DIR index.js  #scriptarguments
;;
stop)
exec forever stop --sourceDir=$DIR index.js
;;
*)
echo \"Usage: /etc/init.d/puppet-service {start|stop}\"
exit 1
;;
esac
exit 0" > $DIR/test.sh

# Make it executable
chmod 755 /etc/init.d/puppet-service

# Start the service
update-rc.d puppet-service defaults