---
layout: "documents"
page_title: "SSH Setup"
sidebar_current: "install"
description: |-
  Setup SSH access for Ansible based installs
---

# SSH Setup

## Create SSH Key Pair

Create an ssh key pair using ssh-keygen

``` 
ssh-keygen -t rsa -f contiv_rsa  -N "" 
```

This will generate two files `contiv_rsa` and `contiv_rsa.pub`. We will use the public key `contiv_rsa.pub` to authorize this key pair to connect to a node and we will use the private key `contiv_rsa` for the installer.

## Add the generated key to all the nodes

For each of the master and worker nodes, add the ssh public key created above to the authorized keys.

```
sshpass -p <password> ssh-copy-id -i contiv_rsa.pub <username>@<hostname> -o StrictHostKeyChecking=no 

```

This can also be achieved by manually adding the id_rsa.pub to ~/.ssh/authorized_keys files.

## Setup password less sudo for the user

See [this](https://wiki.centos.org/TipsAndTricks/BecomingRoot) for instructions on how to setup the passwordless sudo.

As a quick summary you can add the following to `/etc/sudoers` file by running `visudo /etc/sudoers`.
```
<username from above>    ALL=(ALL)       ALL
```