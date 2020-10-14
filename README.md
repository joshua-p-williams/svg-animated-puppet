# SVG Animated Puppet

This is an interactive web-based animated puppet.  It will provide one URL for the `bot`, which is an SVG image that has various animations controlled by another page `index` which contains the puppet master controls.

![Puppet Master Controls](./public/img/puppet_master_controls.png "Puppet Master Controls")

![Bot](./public/img/bot.gif "Bot")

## Running in Development

To run locally on your machine, make sure you have `node` and `npm` installed, then run the following.

```bash
git clone https://github.com/jwilliamsnephos/svg-animated-puppet.git
cd svg-animated-puppet
npm install
npm run start
```

Now you can open a browser to [http://localhost:8080/](http://localhost:8080/), you can open the bot in aseperate browser at [http://localhost:8080/bot/](http://localhost:8080/bot/).

## Technology Stack

The technology stack used includes

* [Node.js](https://nodejs.org/en/) - For web services and server side operations
* [Express.js](https://expressjs.com/) - As the web application framework
* [Socket.IO](https://socket.io/) - For realtime socket interactions between the `bot` and the `puppet master controls`
* [SVG](https://svgjs.com/docs/3.0/) - As our SVG image manipulation framework


# Speech / Voices

The speech is provided by [espeak](https://github.com/espeak-ng/espeak-ng) with specific voices provided by [MBROLA](https://github.com/espeak-ng/espeak-ng/blob/master/docs/mbrola.md).

Install them with the following.

```bash
sudo apt install espeak mbrola mbrola-en1
```

## Text to Speech Function

If you want to change the voice used by the puppet, modify the `speak` function (`let speak = function (message)`) within the `index.js`.

## Mouth Movement Animations

The mouth movement of the puppet is logically simulated by analyzing the contents of the sentance by looking at the words and the syllables contained in the sentance.  It's not exact, but is good enough to pull of the **illusion** of the words being spoken.  To adjust the mouth movement of the puppet, modify the `talk` function (`const talk = function (sentance)`) within the `./js/bot.js`. Specifically, you can modify the `duration` the mouth is to remain open per syllable (`let duration = 80 - (2 * syllableIndex);`) and the `nextDelay` between words and sentances.

# Building a Stand-alone Puppet

These instructions are for building a stand-alone puppet using a single board computer (Raspberry Pi) and a Monitor / TV with HDMI.

## Parts

* `Raspberry Pi` - This example uses a [Raspberry Pi 3 Model B+](https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/)
* `Controllabe Power Relay` - This is used for controlling external devices, such as lights, from the puppet.  There are two places to purchase the device this example will be using; [Controllable Four Outlet Power Relay Module version 2 - (Power Switch Tail Alternative)](https://www.adafruit.com/product/2935), or [Iot Relay - Enclosed High-power Power Relay for Arduino, Raspberry Pi, PIC or Wifi, Relay Shield](https://www.amazon.com/Iot-Relay-Enclosed-High-Power-Raspberry/dp/B00WV7GMA2).
* `TV / Monitor` - Any TV or Monitor that supports `HDMI` should work.
* `Class 10 micro SD card` - For running the operating system of of the Rasbperry pi.  The card must be at least 16 gb and able to write at 10 MB/s.

## Configuring Raspberry Pi

The Raspberry Pi will be configured to run as a `kiosk`.  The raspberry pi can be used as a desktop computer, but we will make it so that it runs the puppet and boots up immediately to a full screen view which will be the puppets face.  We will also configure it so it will broadcast a wifi signal that can be connected to by another device which can be used to control the puppet.

We will create the puppet in 4 steps;

* Install Operating System
* Configure `SVG Animated Puppet`
* Setup remote accessibility
* Establish Kiosk

At the time of this writing the, this example was built using a Raspberry Pi running [Raspberry Pi OS Buster Desktop August 20th 2020 (2020-08-20-raspios-buster-armhf-full.zip)](https://www.raspberrypi.org/downloads/raspberry-pi-os/).  If these instructions are no longer found to be accurate, it might be possible to find updated instructions via a searching engine search using keywords such as `raspberry pi fullscreen browser kiosk`.

### Installing / Configuring Operating System

https://blog.gordonturner.com/2020/06/30/raspberry-pi-full-screen-browser-2020-05-27-raspios-buster/

Refer to the [Official Instructions](https://www.raspberrypi.org/documentation/installation/installing-images/README.md) on installing the operating system for the Raspberry Pi.

On first boot of the Raspberry Pi, you will be booted into the desktop and will be presented with a **Welcome to Raspberry Pi** window.  Be sure to configure your location details appropriately, 

### Configure SVG Animated Puppet

After installing the operating system, your first boot of the raspberry pi will prompt you for things such as your wireless config etc.. After which it will eventually boot to the desktop with an initial setup screen.  Follow the prompts to establish language and location and perform the necessary updates etc..

We will now configure the bot.

1. Clone the application to your pi
2. Set up all the dependencies (voices etc..)
3. Set to run as a service
4. Set up port redirection
5. Configure the pi to run as a kiosk


```bash
cd /home/pi
git clone https://github.com/jwilliamsnephos/svg-animated-puppet.git
cd svg-animated-puppet
npm install
sudo ./scripts/config_pi_accesspoint.sh
sudo ./scripts/config_pi_puppet.sh
sudo reboot
```

> The SVG Animated puppet runs on port `8080` by default, as port `80` is considered a priviledged port requiring elevated priviledges (`sudo`) in order to run.  We will configure port `80` to redirect to port `8080`.

### Enable Remote Connectivity

> If you ran the `sudo ./scripts/configure_pi.sh` script above you can skip this step as `ssh` will already be configured for you.

In the next step, we will disable a lot of the default desktop functionality.  This will require us to ensure another means of connecting to the raspberry pi, other than interacting with the desktop.  We will enable `ssh`.  The original instructions for this can be found in the raspberry pi documentation at [DOCUMENTATION > REMOTE-ACCESS > SSH](https://www.raspberrypi.org/documentation/remote-access/ssh/).

1. Enter `sudo raspi-config` in a terminal window
2. Select `Interfacing Options`
3. Navigate to and select `SSH`
4. Choose `Yes`
5. Select `Ok`
6. Choose `Finish`

You can now connect remotely to your pi from a seperate computer as long as you know it's IP address.

```bash
ssh pi@<your pis ip address>
```

### Establish Kiosk

> If you ran the `sudo ./scripts/configure_pi.sh` script above you can skip this step as this has already been configured for you.

While the normal OS installation presents a desktop, we want this raspberry pi to serve only 1 purpose, rendering the full screen page of the bot.  For this will will need to disable much of the desktop functionality such the desktop itself, screensavers, etc..

#### Disable Screensaver

