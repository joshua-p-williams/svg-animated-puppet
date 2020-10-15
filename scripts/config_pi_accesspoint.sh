#!/bin/bash

apt update -y

# Install the access point and network management software
apt install hostapd -y

systemctl unmask hostapd
systemctl enable hostapd

apt install dnsmasq -y

DEBIAN_FRONTEND=noninteractive apt install -y netfilter-persistent iptables-persistent

# Define the wireless interface IP configuration
echo "

interface wlan0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
" >> /etc/dhcpcd.conf

# Enable routing and IP masquerading
echo "# https://www.raspberrypi.org/documentation/configuration/wireless/access-point-routed.md
# Enable IPv4 routing
net.ipv4.ip_forward=1
" > /etc/sysctl.d/routed-ap.conf

# Add a new iptables rule
# Add IP masquerading for outbound traffic on eth0 using iptables
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Make sure this rule is in effect at the next start
exitLineNo=`grep -n "exit 0" /etc/rc.local | tail -1 | cut -d: -f1`
sed -i "${exitLineNo}s/^/\n/" /etc/rc.local
sed -i "${exitLineNo}s/^/iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\n/" /etc/rc.local
sed -i "${exitLineNo}s/^/\n/" /etc/rc.local

netfilter-persistent save

# Configure the DHCP and DNS services for the wireless network
mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig

echo "interface=wlan0 # Listening interface
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
                # Pool of IP addresses served via DHCP
domain=wlan     # Local wireless DNS domain
address=/gw.wlan/192.168.4.1
                # Alias for this router
" > /etc/dnsmasq.conf

# Ensure wireless operation
rfkill unblock wlan

# Configure the access point software
echo "country_code=US
interface=wlan0
ssid=bot
hw_mode=g
channel=7
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=letmein123
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
" > /etc/hostapd/hostapd.conf
