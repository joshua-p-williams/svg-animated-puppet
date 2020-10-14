#!/bin/bash

# Install hostapd and dnsmasq
apt update -y
apt install hostapd dnsmasq bridge-utils -y

# Stop the services so we can operate on it's configuration
systemctl stop hostapd
systemctl stop dnsmasq

# Configure a static IP for the wlan0 interface
echo "

interface wlan0
static ip_address=192.168.0.10/24
denyinterfaces eth0
denyinterfaces wlan0
" > /etc/dhcpcd.conf

# Configure the DHCP server (dnsmasq)
# Back up the old
mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig
# Provide IP addresses between 192.168.0.11 and 192.168.0.30 for the wlan0 interface
echo "interface=wlan0
  dhcp-range=192.168.0.11,192.168.0.30,255.255.255.0,24h
" > /etc/dnsmasq.conf


# Configure the access point
echo "interface=wlan0
bridge=br0
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
ssid=bot
wpa_passphrase=bot
" > /etc/hostapd/hostapd.conf

# Specify the configuration for our host access point
echo "

DAEMON_CONF="/etc/hostapd/hostapd.conf"
" >> /etc/default/hostapd

# Set up traffic forwarding (in case they want to use this as a bridge to the LAN)
echo "

net.ipv4.ip_forward=1
" >> /etc/sysctl.conf

# Add a new iptables rule
# Add IP masquerading for outbound traffic on eth0 using iptables
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Make sure this rule is in effect at the next start
exitLineNo=`grep -n "exit 0" /etc/rc.local | tail -1 | cut -d: -f1`
sudo sed -i "${exitLineNo}s/^/\n/" /etc/rc.local
sudo sed -i "${exitLineNo}s/^/iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\n/" /etc/rc.local
sudo sed -i "${exitLineNo}s/^/\n/" /etc/rc.local


# Enable internet connection over the bridge
brctl addbr br0
brctl addif br0 eth0

echo "

auto br0
iface br0 inet manual
bridge_ports eth0 wlan0
" >> /etc/network/interfaces
