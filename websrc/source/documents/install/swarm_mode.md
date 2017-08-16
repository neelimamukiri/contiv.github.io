---
layout: "documents"
page_title: "Docker Swarm Mode"
sidebar_current: "install"
description: |-
  Contiv Install for Docker Swarm Mode
---

# Install Contiv on native Docker Swarm cluster

## Prerequisites
* Python installed on the master and worker nodes.
* Docker installed on the host where you are running the installer. This can be one of the hosts in the cluster.
* Docker Swarm installed in native swarm mode (requires 17.03+ version of Docker engine where swarm functionality is inbuilt). See [details](https://docs.docker.com/engine/swarm/). 
* [Setup the master and worker nodes for SSH access](ssh_setup.html)
* [Install bzip2 on all the nodes](https://github.com/contiv/ansible/issues/364)

## Download Contiv Installer

* Download the installer bundle

```
curl -L -O https://github.com/contiv/install/releases/download/$VERSION/contiv-$VERSION.tgz
```

*If your access to the Internet is limited or slow and you want to download the full Contiv install, choose
`contiv-full-$VERSION.tgz` instead of `contiv-$VERSION.tgz`.
The full image contains only Contiv components and needs external network access for Contiv dependencies.*

* Extract the install bundle 

```
tar oxf contiv-$VERSION.tgz
```
* Change directory to the extracted folder 

```
cd contiv-$VERSION
```

## Installing and Removing Contiv

Contiv Installer for v2Plugin installs the Contiv Docker network plugin on all the nodes in the cluster.
By default, it also installs a distributed datastore `etcd`, which is used to store the Contiv network and policy configuration state. You can alternatively give the installer a pre-setup etcd instance to use.

### Install Contiv on non-ACI setups

* Create an inventory configuration file describing the nodes on which Contiv is being installed.
* Example configuration file is available at install/ansible/cfg.yml, in the install folder.
* Install Contiv in the default bridge mode(also installs etcd). 

```
./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p
```

* Install Contiv in routing mode(also installs etcd).

```
./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p -d routing
```

* Install Contiv in the default bridge mode(use an external etcd).

```
./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p -s etcd://<host>:<port>
```

* Install Contiv in routing mode(use an external etcd).

```
./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p -d routing -s etcd://<host>:<port>
```

### Install Contiv on ACI setups

* Create an inventory configuration file describing the nodes on which Contiv is being installed.
* Example ACI configuration file is available at install/ansible/aci_cfg.yml, in the install folder.

* Install Contiv in the default bridge mode(also installs etcd). 

```
./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p -m aci
```

* Install Contiv in routing mode(also installs etcd).

```
./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p -d routing -m aci
```

* Install Contiv in the default bridge mode(use an external etcd).

```
./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p -s etcd://<host>:<port> -m aci
```

* Install Contiv in routing mode(use an external etcd).

```
./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p -d routing -s etcd://<host>:<port> -m aci
```

### Removing Contiv

* Create an inventory configuration file identical to the one used for the installer.
* Contiv uninstall uses the same parameters as the corresponding Contiv installation, using the `uninstall_swarm.sh` script. For example, if the install was done on a non-ACI setup using the following command:

```
./install/ansible/install_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p
```
You can use the following command to do the uninstall:

```
./install/ansible/uninstall_swarm.sh -f cfg.yml -e <ssh key> -u <username> -p
```
* Note: Adding the `-r` flag to the uninstall command, will cleanup any Contiv state.
* [Current uninstall does not remove etcd](https://github.com/contiv/install/issues/234)