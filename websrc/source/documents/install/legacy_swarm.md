---
layout: "documents"
page_title: "Legacy Docker Swarm"
sidebar_current: "install"
description: |-
  Contiv Install for Legacy Docker Swarm
---

# Docker Swarm Installation

### Prerequisites
* CentOS 7.x operating system.
* Python installed on the master and worker nodes.
* Docker installed on the host where you are running the installer.
* Install a Docker Swarm cluster in either legacy swarm mode or native swarm mode (requires 17.03+ version of Docker engine where swarm functionality is inbuilt). Alternatively, use the Contiv installer to setup docker and legacy swarm stack on cluster nodes.

### Contiv Installation with Legacy Swarm Mode

The Contiv Docker Swarm installer is launched from a host external to the cluster.  All the nodes must be accessible to the Contiv Ansible-based installer host through SSH.
![installer](installer.png)
* Download the installer bundle: <br>`curl -L -O https://github.com/contiv/install/releases/download/$VERSION/contiv-$VERSION.tgz`<br>
If your access to the Internet is limited or slow and you want to download the full Contiv install, choose <br>
`contiv-full-$VERSION.tgz`<br>
Note: The full image contains only Contiv components. Installing Docker Swarm will need Internet connectivity.
* Extract the install bundle <br>`tar oxf contiv-$VERSION.tgz`.
* Change directories to the extracted folder <br>`cd contiv-$VERSION`

* To install Contiv with Docker Legacy Swarm:<br> `./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -i`
* To install Contiv with Docker Legacy Swarm and ACI:<br> `./install/ansible/install_swarm.sh -f aci_cfg.yml -e <ssh key> -u <username> -i -m aci`

* Example host config files are available at install/ansible/cfg.yml and install/ansible/aci_cfg.yml
* To see additional install options and examples, run <br>`./install/ansible/install_swarm.sh -h`.
