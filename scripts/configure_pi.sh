#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
cd $DIR

# Install voices
apt update -y
apt install espeak-ng --fix-missing -y
wget http://steinerdatenbank.de/software/mbrola3.0.1h_armhf.deb
dpkg -i mbrola3.0.1h_armhf.deb
rm mbrola3.0.1h_armhf.deb
apt install mbrola mbrola-en1 -y
ln -s /usr/bin/espeak-ng /usr/bin/espeak

# Install the node forever script for the service
npm install forever -g

# Create the service
echo "#!/bin/sh
#/etc/init.d/puppet-service
export PATH=\$PATH:/usr/local/bin
export NODE_PATH=\$NODE_PATH:/usr/local/lib/node_modules

case \"\$1\" in
start)
exec forever --sourceDir=$DIR -p $DIR index.js &
;;
stop)
exec forever stop --sourceDir=$DIR index.js
;;
*)
echo \"Usage: /etc/init.d/puppet-service {start|stop}\"
exit 1
;;
esac
exit 0" > /etc/init.d/puppet-service

# Make it executable
chmod 755 /etc/init.d/puppet-service

# Start the service
update-rc.d puppet-service defaults
service puppet-service start

# Redirect port 80 to port 8080
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables --wait --table nat --append OUTPUT --protocol tcp --dport 80 --jump REDIRECT --to-port 8080

# Ensure everything continues to start at next startup
echo "#!/bin/sh -e

iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables --wait --table nat --append OUTPUT --protocol tcp --dport 80 --jump REDIRECT --to-port 8080

service puppet-service start

exit 0
" > /etc/rc.local