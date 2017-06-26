---
layout: "documents"
page_title: "Container Networking Tutorial (Kubernetes)"
sidebar_current: "tutorials-container-101-k8s"
description: |-
  Container Networking Tutorial (Kubernetes)
---


## Container Networking Tutorial with Contiv + Kubernetes

- [Prerequisites](#prereqs)
- [Setup](#prereqs)
- [Chapter 1 - Introduction to Container Networking](#ch1)
- [Chapter 2 - Multi-host networking](#ch2)
- [Chapter 3 - Using multiple tenants with arbitrary IPs in the networks](#ch3)
- [Chapter 4 - Connecting pods to external networks](#ch4)
- [Cleanup](#cleanup)

This tutorial walks through container networking concepts step by step in a Kubernetes environment. We will explore Contiv's networking features along with policies in the next tutorial.

### <a name="prereqs"></a> Prerequisites 
1. [Download Vagrant](https://www.vagrantup.com/downloads.html)
2. [Download Virtualbox](https://www.virtualbox.org/wiki/Downloads)
3. [Install git client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
4. [Install docker for mac](https://docs.docker.com/docker-for-mac/install/)

**Note**:
If you are using a platform other than Mac, please install docker-engine, for that platform.

Make virtualbox the default provider for vagrant.

```
export VAGRANT_DEFAULT_PROVIDER=virtualbox
```

The steps below download a centos vagrant box. If you have a centos box available already, or you have access to the box file, add it to a list of box images with the specific name centos/7, as follows:

```
vagrant box add --name centos/7 CentOS-7-x86_64-Vagrant-1703_01.VirtualBox.box
```
 
### <a name="setup"></a> Setup

#### Step 1: Get contiv installer code from github.

```
$ git clone https://github.com/contiv/install.git
$ cd install
```

#### Step 2: Install Contiv + Kubernetes using Vagrant on the VMs created on VirtualBox

**Note**:
Please make sure that you are NOT connected to VPN here.

```
$ make demo-kubeadm
$ cd cluster
```

**Note**: 
Please do not try to work in both the Legacy Swarm and Kubernetes environments at the same time. This will not work.

This will create two VMs on VirtualBox. It installs Kubernetes using [kubeadm](https://kubernetes.io/docs/setup/independent/install-kubeadm/) and all the required services and software for Contiv. This might take some time (usually approx 15-20 mins) depending upon your internet connection.

-- OR --
#### Step 2a: Create a vagrant VM cluster

```
$ make cluster-kubeadm
```

This will create two VMs on VirtualBox. 

#### Step 2b: Download the Contiv release bundle on the master node

Note that this step is different from the Legacy Swarm tutorial. This installation is run on the master node itself and not from a different installer host.

```
$ cd cluster
$ vagrant ssh kubeadm-master
[vagrant@kubeadm-master ~]$ curl -L -O https://github.com/contiv/install/releases/download/1.0.3/contiv-1.0.3.tgz
[vagrant@kubeadm-master ~]$ tar xf contiv-1.0.3.tgz
```

#### Step 2c: Install Contiv

```
[vagrant@kubeadm-master ~]$ cd contiv-1.0.3
[vagrant@kubeadm-master contiv-1.0.3]$ ifconfig eth1
eth1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.2.54  netmask 255.255.255.0  broadcast 192.168.2.255
        inet6 fe80::a00:27ff:fe72:826  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:72:08:26  txqueuelen 1000  (Ethernet)
        RX packets 3  bytes 1026 (1.0 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 18  bytes 2424 (2.3 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

You will use the eth1 address as the Contiv netmaster control plane IP.

```
[vagrant@kubeadm-master contiv-1.0.3]$ sudo ./install/k8s/install.sh -n 192.168.2.54
```

Make note of the final outcome of this process. This lists the URL for the UI. There are instructions for setting up a default network as well.

```
Installation is complete
=========================================================

Contiv UI is available at https://192.168.2.54:10000
Please use the first run wizard or configure the setup as follows:
 Configure forwarding mode (optional, default is bridge).
 netctl global set --fwd-mode routing
 Configure ACI mode (optional)
 netctl global set --fabric-mode aci --vlan-range <start>-<end>
 Create a default network
 netctl net create -t default --subnet=<CIDR> default-net
 For example, netctl net create -t default --subnet=20.1.1.0/24 -g 20.1.1.1 default-net

=========================================================
```

```
[vagrant@kubeadm-master contiv-1.0.3]$ exit
```

#### Step 3: Check vagrant VM nodes.

**Note**:
On Windows, you will need a ssh client to be installed like putty, cygwin etc.

This command will show you list of VMs which we have created. Make sure you are in the cluster folder.

```
$ vagrant status
Current machine states:

...
kubeadm-master            running (virtualbox)
kubeadm-worker0           running (virtualbox)

This environment represents multiple VMs. The VMs are all listed
above with their current state. For more information about a specific
VM, run `vagrant status NAME`.
```

The above command shows the node information, version, etc.

#### Step 4: Hello world Kubernetes.

As a part of this Contiv installation, we install Kubernetes for you. To verify the Kubernetes cluster, please execute the following commands on the Vagrant VMs.

```
$ vagrant ssh kubeadm-master
```

Now you will be logged into the Kubernetes master Vagrant VM.
`kubectl` is the command line client to connect to Kubernetes API server.

```
[vagrant@kubeadm-master ~]$ kubectl version
Client Version: version.Info{Major:"1", Minor:"6", GitVersion:"v1.6.5", GitCommit:"490c6f13df1cb6612e0993c4c14f2ff90f8cdbf3", GitTreeState:"clean", BuildDate:"2017-06-14T20:15:53Z", GoVersion:"go1.7.6", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"6", GitVersion:"v1.6.4", GitCommit:"d6f433224538d4f9ca2f7ae19b252e6fcb66a3ae", GitTreeState:"clean", BuildDate:"2017-05-19T18:33:17Z", GoVersion:"go1.7.5", Compiler:"gc", Platform:"linux/amd64"}
```
```
[vagrant@kubeadm-master ~]$ kubectl get nodes -o wide
NAME              STATUS    AGE       VERSION   EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION
kubeadm-master    Ready     9m        v1.6.5    <none>        CentOS Linux 7 (Core)   3.10.0-514.16.1.el7.x86_64
kubeadm-worker0   Ready     6m        v1.6.5    <none>        CentOS Linux 7 (Core)   3.10.0-514.16.1.el7.x86_64
```
```
[vagrant@kubeadm-master ~]$ kubectl describe nodes
Name:     kubeadm-master
Role:
Labels:     beta.kubernetes.io/arch=amd64
      beta.kubernetes.io/os=linux
      kubernetes.io/hostname=kubeadm-master
      node-role.kubernetes.io/master=
Annotations:    node.alpha.kubernetes.io/ttl=0
      volumes.kubernetes.io/controller-managed-attach-detach=true
Taints:     node-role.kubernetes.io/master:NoSchedule
CreationTimestamp:  Mon, 19 Jun 2017 19:02:22 +0000
Phase:
Conditions:
  Type      Status  LastHeartbeatTime     LastTransitionTime    Reason        Message
  ----      ------  -----------------     ------------------    ------        -------
  OutOfDisk     False   Mon, 19 Jun 2017 19:11:53 +0000   Mon, 19 Jun 2017 19:02:22 +0000   KubeletHasSufficientDisk  kubelet has sufficient disk space available
  MemoryPressure  False   Mon, 19 Jun 2017 19:11:53 +0000   Mon, 19 Jun 2017 19:02:22 +0000   KubeletHasSufficientMemory  kubelet has sufficient memory available
  DiskPressure    False   Mon, 19 Jun 2017 19:11:53 +0000   Mon, 19 Jun 2017 19:02:22 +0000   KubeletHasNoDiskPressure  kubelet has no disk pressure
  Ready     True  Mon, 19 Jun 2017 19:11:53 +0000   Mon, 19 Jun 2017 19:05:22 +0000   KubeletReady      kubelet is posting ready status
Addresses:    192.168.2.54,192.168.2.54,kubeadm-master
Capacity:
 cpu:   1
 memory:  1883804Ki
 pods:    110
Allocatable:
 cpu:   1
 memory:  1781404Ki
 pods:    110
System Info:
 Machine ID:      5f08662a06cb4ea885f592a26cebb84a
 System UUID:     5F08662A-06CB-4EA8-85F5-92A26CEBB84A
 Boot ID:     994297a1-e55d-4a88-8415-8cf4c90ec4ed
 Kernel Version:    3.10.0-514.16.1.el7.x86_64
 OS Image:      CentOS Linux 7 (Core)
 Operating System:    linux
 Architecture:      amd64
 Container Runtime Version: docker://1.12.6
 Kubelet Version:   v1.6.5
 Kube-Proxy Version:    v1.6.5
ExternalID:     kubeadm-master
Non-terminated Pods:    (9 in total)
  Namespace     Name            CPU Requests  CPU Limits  Memory Requests Memory Limits
  ---------     ----            ------------  ----------  --------------- -------------
  kube-system     contiv-api-proxy-lgcg7        0 (0%)    0 (0%)    0 (0%)    0 (0%)
  kube-system     contiv-etcd-2g52j       0 (0%)    0 (0%)    0 (0%)    0 (0%)
  kube-system     contiv-netmaster-n8dhg        0 (0%)    0 (0%)    0 (0%)    0 (0%)
  kube-system     contiv-netplugin-tvvlb        0 (0%)    0 (0%)    0 (0%)    0 (0%)
  kube-system     etcd-kubeadm-master       0 (0%)    0 (0%)    0 (0%)    0 (0%)
  kube-system     kube-apiserver-kubeadm-master     250m (25%)  0 (0%)    0 (0%)    0 (0%)
  kube-system     kube-controller-manager-kubeadm-master    200m (20%)  0 (0%)    0 (0%)    0 (0%)
  kube-system     kube-proxy-t9hs4        0 (0%)    0 (0%)    0 (0%)    0 (0%)
  kube-system     kube-scheduler-kubeadm-master     100m (10%)  0 (0%)    0 (0%)    0 (0%)
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  CPU Requests  CPU Limits  Memory Requests Memory Limits
  ------------  ----------  --------------- -------------
  550m (55%)  0 (0%)    0 (0%)    0 (0%)
Events:
  FirstSeen LastSeen  Count From        SubObjectPath Type    Reason      Message
  --------- --------  ----- ----        ------------- --------  ------      -------
  10m   10m   1 kubelet, kubeadm-master       Normal    Starting    Starting kubelet.
  10m   10m   1 kubelet, kubeadm-master       Warning   ImageGCFailed   unable to find data for container /
  10m   9m    27  kubelet, kubeadm-master       Normal    NodeHasSufficientDisk Node kubeadm-master status is now: NodeHasSufficientDisk
  10m   9m    27  kubelet, kubeadm-master       Normal    NodeHasSufficientMemory Node kubeadm-master status is now: NodeHasSufficientMemory
  10m   9m    27  kubelet, kubeadm-master       Normal    NodeHasNoDiskPressure Node kubeadm-master status is now: NodeHasNoDiskPressure
  9m    9m    1 kube-proxy, kubeadm-master      Normal    Starting    Starting kube-proxy.
  6m    6m    1 kubelet, kubeadm-master       Normal    NodeReady   Node kubeadm-master status is now: NodeReady


Name:     kubeadm-worker0
Role:
Labels:     beta.kubernetes.io/arch=amd64
      beta.kubernetes.io/os=linux
      kubernetes.io/hostname=kubeadm-worker0
Annotations:    node.alpha.kubernetes.io/ttl=0
      volumes.kubernetes.io/controller-managed-attach-detach=true
Taints:     <none>
CreationTimestamp:  Mon, 19 Jun 2017 19:04:41 +0000
Phase:
Conditions:
  Type      Status  LastHeartbeatTime     LastTransitionTime    Reason        Message
  ----      ------  -----------------     ------------------    ------        -------
  OutOfDisk     False   Mon, 19 Jun 2017 19:11:52 +0000   Mon, 19 Jun 2017 19:04:42 +0000   KubeletHasSufficientDisk  kubelet has sufficient disk space available
  MemoryPressure  False   Mon, 19 Jun 2017 19:11:52 +0000   Mon, 19 Jun 2017 19:04:42 +0000   KubeletHasSufficientMemory  kubelet has sufficient memory available
  DiskPressure    False   Mon, 19 Jun 2017 19:11:52 +0000   Mon, 19 Jun 2017 19:04:42 +0000   KubeletHasNoDiskPressure  kubelet has no disk pressure
  Ready     True  Mon, 19 Jun 2017 19:11:52 +0000   Mon, 19 Jun 2017 19:05:22 +0000   KubeletReady      kubelet is posting ready status
Addresses:    192.168.2.55,192.168.2.55,kubeadm-worker0
Capacity:
 cpu:   1
 memory:  500396Ki
 pods:    110
Allocatable:
 cpu:   1
 memory:  397996Ki
 pods:    110
System Info:
 Machine ID:      4296ae5f450d4f2cba94642f7ba5eefb
 System UUID:     4296AE5F-450D-4F2C-BA94-642F7BA5EEFB
 Boot ID:     355607dc-67c7-4464-af09-3b8681355d39
 Kernel Version:    3.10.0-514.16.1.el7.x86_64
 OS Image:      CentOS Linux 7 (Core)
 Operating System:    linux
 Architecture:      amd64
 Container Runtime Version: docker://1.12.6
 Kubelet Version:   v1.6.5
 Kube-Proxy Version:    v1.6.5
ExternalID:     kubeadm-worker0
Non-terminated Pods:    (3 in total)
  Namespace     Name          CPU Requests  CPU Limits  Memory Requests Memory Limits
  ---------     ----          ------------  ----------  --------------- -------------
  kube-system     contiv-netplugin-6d95p      0 (0%)    0 (0%)    0 (0%)    0 (0%)
  kube-system     kube-dns-692378583-0pt26    260m (26%)  0 (0%)    110Mi (28%) 170Mi (43%)
  kube-system     kube-proxy-pbk2h      0 (0%)    0 (0%)    0 (0%)    0 (0%)
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  CPU Requests  CPU Limits  Memory Requests Memory Limits
  ------------  ----------  --------------- -------------
  260m (26%)  0 (0%)    110Mi (28%) 170Mi (43%)
Events:
  FirstSeen LastSeen  Count From        SubObjectPath Type    Reason      Message
  --------- --------  ----- ----        ------------- --------  ------      -------
  7m    7m    1 kubelet, kubeadm-worker0      Normal    Starting    Starting kubelet.
  7m    7m    1 kubelet, kubeadm-worker0      Warning   ImageGCFailed   unable to find data for container /
  7m    7m    2 kubelet, kubeadm-worker0      Normal    NodeHasSufficientDisk Node kubeadm-worker0 status is now: NodeHasSufficientDisk
  7m    7m    2 kubelet, kubeadm-worker0      Normal    NodeHasSufficientMemory Node kubeadm-worker0 status is now: NodeHasSufficientMemory
  7m    7m    2 kubelet, kubeadm-worker0      Normal    NodeHasNoDiskPressure Node kubeadm-worker0 status is now: NodeHasNoDiskPressure
  7m    7m    1 kube-proxy, kubeadm-worker0     Normal    Starting    Starting kube-proxy.
  6m    6m    1 kubelet, kubeadm-worker0      Normal    NodeReady   Node kubeadm-worker0 status is now: NodeReady
```

You can see a two node Kubernetes cluster running the latest Kubernetes version.
The kubeadm-master node also has a taint `Taints: node-role.kubernetes.io/master:NoSchedule` that tells the Kubernetes scheduler to not schedule worker workloads on the master node causing all worker pods to be scheduled on kubeadm-worker0.

#### Step 5: Check contiv and related services.

```
[vagrant@kubeadm-master ~]$ kubectl get pods -n kube-system
NAME                                     READY     STATUS    RESTARTS   AGE
contiv-api-proxy-r6cvg                   1/1       Running   0          17m
contiv-etcd-mkb0g                        1/1       Running   0          17m
contiv-netmaster-1fzsz                   1/1       Running   0          17m
contiv-netplugin-mb478                   1/1       Running   2          17m
contiv-netplugin-vpjw8                   1/1       Running   0          17m
etcd-kubeadm-master                      1/1       Running   0          20m
kube-apiserver-kubeadm-master            1/1       Running   0          21m
kube-controller-manager-kubeadm-master   1/1       Running   0          20m
kube-dns-692378583-60lqq                 3/3       Running   0          21m
kube-proxy-2vx4f                         1/1       Running   0          21m
kube-proxy-f7p78                         1/1       Running   0          17m
kube-scheduler-kubeadm-master            1/1       Running   0          20m
```

You should see contiv-netmaster, contiv-netplugin, contiv-etcd and contiv-api-proxy nodes in `Running` status. A small number of initial restarts are normal while all the pods startup, but you should not see an increasing number here.

`netctl` is a utility to create, update, read and modify Contiv objects. It is a CLI wrapper on top of REST interface.

```
[vagrant@kubeadm-master ~]$ netctl version
Client Version:
Version: 1.0.3
GitCommit: c61eb64
BuildTime: 06-08-2017.01-26-14.UTC

Server Version:
Version: 1.0.3
GitCommit: c61eb64
BuildTime: 06-08-2017.01-26-14.UTC
```
```
[vagrant@kubeadm-master ~]$ netctl net ls -a
Tenant   Network      Nw Type  Encap type  Packet tag  Subnet        Gateway    IPv6Subnet  IPv6Gateway  Cfgd Tag
------   -------      -------  ----------  ----------  -------       ------     ----------  -----------  ---------
default  default-net  data     vxlan       0           20.1.1.0/24   20.1.1.1
default  contivh1     infra    vxlan       0           132.1.1.0/24  132.1.1.1
```

You can see that `netctl` is able to communicate with the Contiv API & policy server, netmaster. You can also see that a `default-net` network has been created.

```
[vagrant@kubeadm-master ~]$ ifconfig docker0
docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 0.0.0.0
        ether 02:42:0d:e0:a5:58  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

[vagrant@kubeadm-master ~]$ ifconfig eth0
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.2.15  netmask 255.255.255.0  broadcast 10.0.2.255
        inet6 fe80::5054:ff:fe88:15b6  prefixlen 64  scopeid 0x20<link>
        ether 52:54:00:88:15:b6  txqueuelen 1000  (Ethernet)
        RX packets 336889  bytes 399925256 (381.3 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 123372  bytes 6973757 (6.6 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

[vagrant@kubeadm-master ~]$ ifconfig eth1
eth1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.2.54  netmask 255.255.255.0  broadcast 192.168.2.255
        inet6 fe80::a00:27ff:fe72:826  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:72:08:26  txqueuelen 1000  (Ethernet)
        RX packets 17195  bytes 2415230 (2.3 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 13926  bytes 7675230 (7.3 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

[vagrant@kubeadm-master ~]$ ifconfig eth2
eth2: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet6 fe80::3ac5:5a79:a7e6:b2e6  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:97:0a:cf  txqueuelen 1000  (Ethernet)
        RX packets 1055  bytes 360810 (352.3 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 2865  bytes 507022 (495.1 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

In the above output, you'll see the following interfaces:  
- `docker0` interface corresponds to the linux bridge and its associated
subnet `172.17.0.1/16`. This is created by the docker daemon automatically, and
is the default network containers would belong to when an override network
is not specified  
- `eth0` in this VM is the management interface, on which we ssh into the VM  
- `eth1` in this VM is the interface that connects to an external network (if needed)  
- `eth2` in this VM is the interface that carries vxlan and control (e.g. etcd) traffic

```
[vagrant@kubeadm-master ~]$ ifconfig contivh0
contivh0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.19.255.254  netmask 255.255.0.0  broadcast 0.0.0.0
        inet6 fe80::2:acff:fe13:fffe  prefixlen 64  scopeid 0x20<link>
        ether 02:02:ac:13:ff:fe  txqueuelen 1000  (Ethernet)
        RX packets 1202  bytes 70169 (68.5 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1420  bytes 685603 (669.5 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

[vagrant@kubeadm-master ~]$ ip route
...
172.19.0.0/16 dev contivh0  proto kernel  scope link  src 172.19.255.254
...
```

```
[vagrant@kubeadm-master ~]$ sudo iptables -t nat -v -L POSTROUTING -n --line-number
Chain POSTROUTING (policy ACCEPT 20 packets, 1200 bytes)
num   pkts bytes target     prot opt in     out     source               destination
1     3451  206K KUBE-POSTROUTING  all  --  *      *       0.0.0.0/0            0.0.0.0/0            /* kubernetes postrouting rules */
2        0     0 MASQUERADE  all  --  *      !docker0  172.17.0.0/16        0.0.0.0/0
3        0     0 MASQUERADE  all  --  *      !contivh0  172.19.0.0/16        0.0.0.0/0
```

Contiv uses contivh0 as the host port to route external traffic. It adds a post routing rule in iptables on the host to masquerade traffic coming through contivh0.

```
[vagrant@kubeadm-master ~]$ ifconfig contivh1
contivh1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 132.1.1.3  netmask 255.255.255.0  broadcast 0.0.0.0
        inet6 fe80::2:84ff:fe01:103  prefixlen 64  scopeid 0x20<link>
        ether 02:02:84:01:01:03  txqueuelen 1000  (Ethernet)
        RX packets 4683  bytes 1437562 (1.3 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 4699  bytes 430994 (420.8 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

[vagrant@kubeadm-master ~]$ ip route
default via 10.0.2.2 dev eth0  proto static  metric 100
10.0.2.0/24 dev eth0  proto kernel  scope link  src 10.0.2.15  metric 100
20.1.1.0/24 via 132.1.1.2 dev contivh1
132.1.1.0/24 dev contivh1  proto kernel  scope link  src 132.1.1.2
172.17.0.0/16 dev docker0  proto kernel  scope link  src 172.17.0.1
172.19.0.0/16 dev contivh0  proto kernel  scope link  src 172.19.255.254
192.168.2.0/24 dev eth1  proto kernel  scope link  src 192.168.2.54  metric 100
```

contivh1 port allows the host to access the container/pod networks in routing mode. As Contiv tenants allow multiple tenants to have the same IP address range, host access is currently supported only for pods in the default tenant.

### <a name="ch1"></a> Chapter 1: Introduction to Container Networking

There are two main container networking models discussed within the community.

#### Docker libnetwork - Container Network Model (CNM)

CNM (Container Network Model) is Docker's libnetwork network model for containers  
- An endpoint is a container's interface into a network  
- A network is collection of arbitrary endpoints  
- A container can belong to multiple endpoints (and therefore multiple networks)  
- CNM allows for co-existence of multiple drivers, with a network managed by one driver  
- Provides Driver APIs for IPAM and Endpoint creation/deletion  
- IPAM Driver APIs: Create/Delete Pool, Allocate/Free IP Address  
- Network Driver APIs: Network Create/Delete, Endpoint Create/Delete/Join/Leave  
- Used by docker engine, docker swarm, and docker compose; and other schedulers
that schedule regular docker containers e.g. Nomad or Mesos docker containerizer

#### CoreOS CNI - Container Network Interface (CNI)
CNI (Container Network Interface) CoreOS's network model for containers  
- Allows container id (uuid) specification for the network interface you create  
- Provides Container Create/Delete events  
- Provides access to network namespace to the driver to plumb networking  
- No separate IPAM Driver: Container Create returns the IPAM information along with other data  
- Used by Kubernetes and thus supported by various Kubernetes network plugins, including Contiv  

The rest of the tutorial walks through Contiv with CNI/Kubernetes examples.

#### Basic container networking

Let's examine the networking a pod gets upon a vanilla run.

```
[vagrant@kubeadm-master ~]$ sudo docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
b60fdf5ccb88        bridge              bridge              local
6feedf8caae3        host                host                local
133512a17887        none                null                local
```

Unlike in the Legacy Swarm tutorial, Contiv networks are not visible under docker networks in a Kubernetes setup. This is because Contiv is a CNI plugin for Kubernetes and not visible as a docker networking CNM plugin in the Kubernetes environment.

```
[vagrant@kubeadm-master ~]$ kubectl run -it vanilla-c --image=alpine /bin/sh
If you don't see a command prompt, try pressing enter.

/ # ifconfig
eth0      Link encap:Ethernet  HWaddr 02:02:14:01:01:03
          inet addr:20.1.1.3  Bcast:0.0.0.0  Mask:255.255.255.0
          inet6 addr: fe80::2:14ff:fe01:103/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1450  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:8 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:648 (648.0 B)  TX bytes:648 (648.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

/ # ip route
default via 20.1.1.1 dev eth0
20.1.1.0/24 dev eth0  src 20.1.1.3
/ # exit
```

```
[vagrant@kubeadm-master ~]$ kubectl get pods -o wide
NAME                         READY     STATUS    RESTARTS   AGE       IP         NODE
vanilla-c-1408101207-vvwxv   1/1       Running   1           1m       20.1.1.3   kubeadm-worker0
```

**Note**:
Please note this pod got scheduled by Kubernetes on kubeadm-worker0 node, as seen in the NODE column above. In order to see all of this pod's interfaces, we must run it on the kubeadm-worker0 node since it is scheduled on that node.

Switch to `kubeadm-worker0`

```
[vagrant@kubeadm-master ~]$ exit

$ vagrant ssh kubeadm-worker0

[vagrant@kubeadm-worker0 ~]$ ifconfig

[vagrant@kubeadm-worker0 ~]$ exit

$ vagrant ssh kubeadm-master
```

In the `ifconfig` output, you will see that it would have created a vvport `virtual 
ethernet interface` that would look like `vvport#`.

The other pair of veth interface is put into the pod with the name `eth0`.

```
[vagrant@kubeadm-master ~]$ kubectl exec -it vanilla-c-1408101207-vvwxv sh
/ # ifconfig eth0
eth0      Link encap:Ethernet  HWaddr 02:02:14:01:01:03
          inet addr:20.1.1.3  Bcast:0.0.0.0  Mask:255.255.255.0
          inet6 addr: fe80::2:14ff:fe01:103/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1450  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:8 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:648 (648.0 B)  TX bytes:648 (648.0 B)

/ # exit
```

When you run a pod without specifying any network, the `default-net` network in the `default` tenant
is connected to the pod's containers.
External connectivity to this pod is provided using SNAT via the default-net gateway.
All traffic to this pod is routed using the contivh1 interface we saw earlier.

### <a name="ch2"></a> Chapter 2: Multi-host networking

There are many solutions like Contiv such as Calico, Weave, OpenShift, OpenContrail, Nuage, VMWare, Docker, Kubernetes, and OpenStack that provide solutions to multi-host container networking. 

In this section, let's examine Contiv and Kubernetes overlay solutions.

#### Multi-host networking with Contiv
Let's use the same example as above to spin up two pods on the two different hosts.

#### 1. Create a multi-host network

```
[vagrant@kubeadm-master ~]$ netctl net create --subnet=10.1.2.0/24 --gateway=10.1.2.1 contiv-net
Creating network default:contiv-net
```
```
[vagrant@kubeadm-master ~]$ netctl net ls
Tenant   Network      Nw Type  Encap type  Packet tag  Subnet        Gateway    IPv6Subnet  IPv6Gateway  Cfgd Tag
------   -------      -------  ----------  ----------  -------       ------     ----------  -----------  ---------
default  contivh1     infra    vxlan       0           132.1.1.0/24  132.1.1.1
default  default-net  data     vxlan       0           20.1.1.0/24   20.1.1.1
default  contiv-net   data     vxlan       0           10.1.2.0/24   10.1.2.1
```
```
[vagrant@kubeadm-master ~]$ netctl net inspect contiv-net
{
  "Config": {
    "key": "default:contiv-net",
    "encap": "vxlan",
    "gateway": "10.1.2.1",
    "networkName": "contiv-net",
    "nwType": "data",
    "subnet": "10.1.2.0/24",
    "tenantName": "default",
    "link-sets": {},
    "links": {
      "Tenant": {
        "type": "tenant",
        "key": "default"
      }
    }
  },
  "Oper": {
    "allocatedIPAddresses": "10.1.2.1",
    "availableIPAddresses": "10.1.2.2-10.1.2.254",
    "externalPktTag": 3,
    "networkTag": "contiv-net.default",
    "pktTag": 3
  }
}
```

We can now spin a couple of pods belonging to the `contiv-net` network.
We will create one pod on the master node and one pod on the worker node.
This will create a pod on the master node because we have specified tolerations in accordance with the master nodes taints.

```
[vagrant@kubeadm-master ~]$ cat <<EOF > contiv-c1.yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    io.contiv.tenant: default
    io.contiv.network: contiv-net
    k8s-app: contiv-c1
  name: contiv-c1
spec: 
  tolerations:
   - key: node-role.kubernetes.io/master
     effect: NoSchedule
  nodeSelector:
    node-role.kubernetes.io/master: ""
  containers: 
    - 
      image: alpine
      name: alpine
      command: 
      - sleep
      - "6000"
EOF


[vagrant@kubeadm-master ~]$ kubectl create -f contiv-c1.yaml
pod "contiv-c1" created

[vagrant@kubeadm-master ~]$ kubectl get pods -o wide
NAME        READY     STATUS    RESTARTS   AGE       IP         NODE
contiv-c1   1/1       Running   0          4s        10.1.2.2   kubeadm-master

[vagrant@kubeadm-master ~]$ kubectl exec -it contiv-c1 sh
/ # ifconfig
eth0      Link encap:Ethernet  HWaddr 02:02:0A:01:02:02
          inet addr:10.1.2.2  Bcast:0.0.0.0  Mask:255.255.255.0
          inet6 addr: fe80::2:aff:fe01:202/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1450  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:8 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:648 (648.0 B)  TX bytes:648 (648.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

/ # exit
```
The IP address of this pod is 10.1.2.2 which means it is part of the `contiv-net` network.

```
[vagrant@kubeadm-master ~]$ kubectl create -f contiv-c2.yaml
pod "contiv-c2" created

[vagrant@kubeadm-master ~]$ kubectl get pods -o wide
NAME        READY     STATUS    RESTARTS   AGE       IP         NODE
contiv-c1   1/1       Running   0          2m        10.1.2.2   kubeadm-master
contiv-c2   1/1       Running   0          6s        10.1.2.3   kubeadm-worker0

[vagrant@kubeadm-master ~]$ kubectl exec -it contiv-c2 sh
/ # ifconfig
eth0      Link encap:Ethernet  HWaddr 02:02:0A:01:02:03
          inet addr:10.1.2.3  Bcast:0.0.0.0  Mask:255.255.255.0
          inet6 addr: fe80::2:aff:fe01:203/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1450  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:8 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:648 (648.0 B)  TX bytes:648 (648.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

/ # exit

```

Now let's try to ping between these two pods.

```
[vagrant@kubeadm-master ~]$ kubectl exec -it contiv-c1 sh
/ # ping -c 3 contiv-c2
PING contiv-c2 (10.1.2.3): 56 data bytes
64 bytes from 10.1.2.3: seq=0 ttl=64 time=1.685 ms
64 bytes from 10.1.2.3: seq=1 ttl=64 time=0.912 ms
64 bytes from 10.1.2.3: seq=2 ttl=64 time=0.913 ms

--- contiv-c2 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 0.912/1.170/1.685 ms
/ # exit
```


### <a name="ch3"></a> Chapter 3: Using multiple tenants with arbitrary IPs in the networks

First, let's create a new tenant space.

```
[vagrant@kubeadm-master ~]$ netctl tenant create blue
Creating tenant: blue
```
```
[vagrant@kubeadm-master ~]$ netctl tenant ls
Name
------
blue
default
```
After the tenant is created, we can create network within tenant `blue`. Here we can choose the same subnet and network name as we used earlier with default tenant, as namespaces are isolated across tenants.

```
[vagrant@kubeadm-master ~]$ netctl net create -t blue --subnet=10.1.2.0/24  -g 10.1.2.1 contiv-net
Creating network blue:contiv-net
```
```
[vagrant@kubeadm-master ~]$ netctl net ls -t blue
Tenant  Network     Nw Type  Encap type  Packet tag  Subnet       Gateway  IPv6Subnet  IPv6Gateway  Cfgd Tag
------  -------     -------  ----------  ----------  -------      ------   ----------  -----------  ---------
blue    contiv-net  data     vxlan       0           10.1.2.0/24
```
Next, we can run pods belonging to this tenant.

```
[vagrant@kubeadm-master ~]$
cat <<EOF > contiv-blue-c1.yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    io.contiv.tenant: blue
    io.contiv.network: contiv-net
    k8s-app: contiv-blue-c1
  name: contiv-blue-c1
spec: 

  containers: 
    - 
      image: alpine
      name: alpine
      command: 
      - sleep
      - "6000"
EOF

[vagrant@kubeadm-master ~]$ kubectl create -f contiv-blue-c1.yaml
pod "contiv-blue-c2" created
```
```
[vagrant@kubeadm-master ~]$
cat <<EOF > contiv-blue-c2.yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    io.contiv.tenant: blue
    io.contiv.network: contiv-net
    k8s-app: contiv-blue-c2
  name: contiv-blue-c2
spec: 
  tolerations:
   - key: node-role.kubernetes.io/master
     effect: NoSchedule
  nodeSelector:
    node-role.kubernetes.io/master: ""
  containers: 
    - 
      image: alpine
      name: alpine
      command: 
      - sleep
      - "6000"
EOF

[vagrant@kubeadm-master ~]$ kubectl create -f contiv-blue-c2.yaml
pod "contiv-blue-c2" created
```
```
[vagrant@kubeadm-master ~]$
cat <<EOF > contiv-blue-c3.yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    io.contiv.tenant: blue
    io.contiv.network: contiv-net
    k8s-app: contiv-blue-c3
  name: contiv-blue-c3
spec: 
  containers: 
    - 
      image: alpine
      name: alpine
      command: 
      - sleep
      - "6000"
EOF

[vagrant@kubeadm-master ~]$ kubectl create -f contiv-blue-c3.yaml
pod "contiv-blue-c3" created
```

Let's see what has been created.

```
[vagrant@kubeadm-master ~]$ kubectl get pods -o wide
NAME             READY     STATUS    RESTARTS   AGE       IP         NODE
contiv-blue-c1   1/1       Running   0          48s       10.1.2.2   kubeadm-worker0
contiv-blue-c2   1/1       Running   0          19s       10.1.2.3   kubeadm-master
contiv-blue-c3   1/1       Running   0          6s        10.1.2.4   kubeadm-worker0
contiv-c1        1/1       Running   0          5m        10.1.2.2   kubeadm-master
contiv-c2        1/1       Running   0          3m        10.1.2.3   kubeadm-worker0
```
Now, let's try to ping between these pods.

```
[vagrant@kubeadm-master ~]$ kubectl exec -it contiv-blue-c1 sh
/ # ping -c 3 10.1.2.3
PING 10.1.2.3 (10.1.2.3): 56 data bytes
64 bytes from 10.1.2.3: seq=0 ttl=64 time=1.197 ms
64 bytes from 10.1.2.3: seq=1 ttl=64 time=0.758 ms
64 bytes from 10.1.2.3: seq=2 ttl=64 time=0.918 ms

--- 10.1.2.3 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 0.758/0.957/1.197 ms
/ # ping -c 3 10.1.2.4
PING 10.1.2.4 (10.1.2.4): 56 data bytes
64 bytes from 10.1.2.4: seq=0 ttl=64 time=1.343 ms
64 bytes from 10.1.2.4: seq=1 ttl=64 time=0.082 ms
64 bytes from 10.1.2.4: seq=2 ttl=64 time=0.065 ms

--- 10.1.2.4 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 0.065/0.496/1.343 ms
--- 10.1.2.3 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 0.084/0.417/1.076 ms
/ # exit
```

### <a name="ch4"></a> Chapter 4: Connecting pods to external networks

In this chapter, we explore ways to connect pods to external networks.

TBD: Add Cluster IP and NodePort access here.

### <a name="cleanup"></a> Cleanup:

To cleanup the setup, after doing all the experiments, exit the VM and destroy the VMs:

```
[vagrant@kubeadm-master ~]$ exit
logout
Connection to 127.0.0.1 closed.
```

```
$ cd .. # go back to install directory
$ make cluster-destroy
cd cluster && vagrant destroy -f
==> kubeadm-worker0: Forcing shutdown of VM...
==> kubeadm-worker0: Destroying VM and associated drives...
==> kubeadm-master: Forcing shutdown of VM...
==> kubeadm-master: Destroying VM and associated drives...
==> swarm-mode-worker0: VM not created. Moving on...
==> swarm-mode-master: VM not created. Moving on...
==> legacy-swarm-worker0: VM not created. Moving on...
==> legacy-swarm-master: VM not created. Moving on...
```
```
$ make vagrant-clean
vagrant global-status --prune
id       name   provider state  directory
--------------------------------------------------------------------
There are no active Vagrant environments on this computer! Or,
you haven't destroyed and recreated Vagrant environments that were
started with an older version of Vagrant.
cd cluster && vagrant destroy -f
==> kubeadm-worker0: VM not created. Moving on...
==> kubeadm-master: VM not created. Moving on...
==> swarm-mode-worker0: VM not created. Moving on...
==> swarm-mode-master: VM not created. Moving on...
==> legacy-swarm-worker0: VM not created. Moving on...
==> legacy-swarm-master: VM not created. Moving on...
```

### References
1. [CNI Specification](https://github.com/containernetworking/cni/blob/master/SPEC.md)
2. [CNM Design](https://github.com/docker/libnetwork/blob/master/docs/design.md)
3. [Contiv User Guide](http://docs.contiv.io)
4. [Contiv Networking Code](https://github.com/contiv/netplugin)

### Improvements or Comments
This tutorial was developed by Contiv engineers. Thank you for trying out this tutorial.
Please file a GitHub issue if you see an issue with the tutorial, or if you prefer
improving some text, feel free to send a pull request.