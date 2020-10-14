#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
cd $DIR

# Install voices and other dependencies
apt update -y
apt install espeak-ng ttf-mscorefonts-installer unclutter x11-xserver-utils --fix-missing -y
wget http://steinerdatenbank.de/software/mbrola3.0.1h_armhf.deb
dpkg -i mbrola3.0.1h_armhf.deb
rm mbrola3.0.1h_armhf.deb
apt install mbrola mbrola-en1 -y
apt autoremove -y
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
exitLineNo=`grep -n "exit 0" /etc/rc.local | tail -1 | cut -d: -f1`
sudo sed -i "${exitLineNo}s/^/\n/" /etc/rc.local
sudo sed -i "${exitLineNo}s/^/service puppet-service start\n/" /etc/rc.local
sudo sed -i "${exitLineNo}s/^/\n/" /etc/rc.local
sudo sed -i "${exitLineNo}s/^/iptables --wait --table nat --append OUTPUT --protocol tcp --dport 80 --jump REDIRECT --to-port 8080\n/" /etc/rc.local
#sudo sed -i "${exitLineNo}s/^/iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080\n/" /etc/rc.local

# Enable ssh
systemctl enable ssh
systemctl start ssh

# Configure kiosk
mkdir -p /home/pi/.config/lxsession/LXDE-pi
echo "#@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
#@xscreensaver -no-splash
@point-rpi

@unclutter
@xset s off
@xset s noblank
@xset -dpms

# Browser 1
#@/usr/bin/chromium-browser --check-for-update-interval=31536000 --incognito --kiosk http://localhost:8080/bot
@$DIR/scripts/chromium_kiosk.sh
" > /home/pi/.config/lxsession/LXDE-pi/autostart
chown -R pi:pi /home/pi/.config/lxsession/

# Disable screensaver
xset s off
xset -dpms
xset s noblank
echo "

[SeatDefaults]
xserver-command=X -s 0 -dpms

" >> /etc/lightdm/lightdm.conf

# Hide desktop and background and icons
mv /etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.conf /etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.bak

echo "[*]
desktop_bg=#000000000000
desktop_shadow=#000000000000
desktop_fg=#e8e8e8e8e8e8
desktop_font=PibotoLt 12
wallpaper=/usr/share/rpd-wallpaper/clouds.jpg
wallpaper_mode=color
show_documents=0
show_trash=0
show_mounts=0
" > /etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.conf

if [[ -f "/home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf" ]]; then
    mv /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.bak

    echo "[*]
desktop_bg=#000000000000
desktop_shadow=#000000000000
desktop_fg=#e8e8e8e8e8e8
desktop_font=PibotoLt 12
wallpaper=/usr/share/rpd-wallpaper/clouds.jpg
wallpaper_mode=color
show_documents=0
show_trash=0
show_mounts=0
" > /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf


    chown -R pi:pi /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf
fi
