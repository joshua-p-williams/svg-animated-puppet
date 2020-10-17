# SVG Animated Puppet

This is an interactive web-based animated puppet.  It will provide one URL for the `bot`, which is an SVG image that has various animations controlled by another page `index` which contains the puppet master controls.

**Puppet Face**

The following is an example of what the bot looks like.

![Bot](./public/img/bot.gif "Bot")

**Puppet Master Controls**

The following is what is presented to the `puppet master` allowing for remote control of the bot.

![Puppet Master Controls](./public/img/puppet_master_controls.png "Puppet Master Controls")

## Running in Development

To run locally on your machine, make sure you have `node` and `npm` installed, then run the following.

```bash
git clone https://github.com/jwilliamsnephos/svg-animated-puppet.git
cd svg-animated-puppet
npm install
npm run start
```

Now you can open a browser to [http://localhost:8080/](http://localhost:8080/), you can open the bot in aseperate browser at [http://localhost:8080/bot/](http://localhost:8080/bot/).

## Configuration

The application can be configured with the following variables, supplied as either environment variables or via an `.env` file at the root of the project (see `.env.example` for a sample file).

* `PORT` - The port the node app will listen on *(defaults to 8080)*
* `SHUTDOWN_COMMAND` - If you want to allow a `Shutdown` button to be enabled.  Useful when using the puppet on a raspberry pi. *(defaults to `null`)* `SPEAK_COMMAND` - The command to use for generating speech.  The message to speak will be provided as a prameter to this command *(defaults to "espeak -v mb-en1+f3 -s 100")*
* `SOUND_COMMAND` - The command to use for playing sound files.  The filename will be supplied as a paramter to this command *(defaults to aplay)*

## Technology Stack

The technology stack used includes

* [Node.js](https://nodejs.org/en/) - For web services and server side operations
* [Express.js](https://expressjs.com/) - As the web application framework
* [ejs (Embedded JavaScript templates)](hhttps://github.com/mde/ejs) - The express templating engine used
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

The Raspberry Pi is commonly configured to run as a desktop computer by default.  We will modify it to run as a `kiosk` and a wireless access point.  It will run the puppet in full screen immediately after booting up as a full screen view of the puppets face.  We will also configure it so it will broadcast a wifi signal that can be connected to by another device (such as your phone or a laptop) which can be used to control the puppet.

After it is set up you will simply be able to connect it to a TV / Monitor and it will begin to broadcast a wireless connection named `bot` with the default password of `letmein123`.  After configuring the pi, and connecting to it from another computer, you can open a browser window to [http://app.bot/](http://app.bot/) where you will be presented with the puppet master controls for operating the puppet.

We will create the puppet in 2 steps;

* Install Operating System
* Configure `SVG Animated Puppet`

At the time of this writing the, this example was built using a Raspberry Pi running [Raspberry Pi OS Buster Desktop August 20th 2020 (2020-08-20-raspios-buster-armhf-full.zip)](https://www.raspberrypi.org/downloads/raspberry-pi-os/).  If these instructions are no longer found to be accurate, it might be possible to find updated instructions via a searching engine search using keywords such as `raspberry pi fullscreen browser kiosk`.

There are 2 scripts that you can refer to with instructions that when were used to configure the puppet.

* `./scripts/config_pi_puppet.sh` - Set's up the puppet
* `./scripts/config_pi_accesspoint.sh` - Configures the wireless access point.

## Installing / Configuring Operating System

Refer to the [Official Instructions](https://www.raspberrypi.org/documentation/installation/installing-images/README.md) on installing the operating system for the Raspberry Pi.

On first boot of the Raspberry Pi, you will be booted into the desktop and will be presented with a **Welcome to Raspberry Pi** window that will need to be completed.  Remember the password you set up, as this will be required if you wish to upgrade or perform other maintenance at a later time.

## Configure SVG Animated Puppet

After installing the operating system, your first boot of the raspberry pi will prompt you for things such as your wireless config etc.. After which it will eventually boot to the desktop with an initial setup screen.  Follow the prompts to establish language and location and perform the necessary updates etc..

We will now configure the bot with the provided scripts.

```bash
cd /home/pi
git clone https://github.com/jwilliamsnephos/svg-animated-puppet.git
cd svg-animated-puppet
npm install
npm install
sudo ./scripts/config_pi_puppet.sh
sudo ./scripts/config_pi_accesspoint.sh
sudo reboot
```

## Maintenance / Upgrading

The puppet is configured with `ssh` access so you can perform maintenance on the bot app remotely at a later time.  After connecting to the bot via the wifi access point, you can connect an ethernet cable to an internet connected network and run the following.

> **Note** - The following commands will require you to supply the password you originally configured your pi with.  If you didn't change the password, try using `raspberry` or `bot`.

```bash
ssh pi@192.168.4.1
```

After connecting the following commands are used to upgrade your puppet to the latest version.

```bash
cd /home/pi/svg-animated-puppet
git checkout .
git fetch -p && git pull
npm install
sudo reboot
```
