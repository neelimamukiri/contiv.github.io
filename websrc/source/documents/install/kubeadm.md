---
layout: "documents"
page_title: "Contiv on Kubeadm Cluster"
sidebar_current: "install"
description: |-
  Contiv on Kubeadm Cluster
---

# Contiv Installation for Kubernetes 1.4+ cluster setup with Kubeadm

## Prerequisites


### Proxy Configuration

export no_proxy=ips of all nodes in cluster,127.0.0.1,localhost,netmaster

If your servers are behind an http proxy, configure the proxy.

``` 
export http_proxy=<proxy_url>
export https_proxy=<proxy_url>

```

### Host Name/IP Configuration

1. Ensure that /etc/hosts has the host name to IP mapping for the host. This IP must be accessible to all the nodes in the Kubernetes cluster.
1. Ensure that `hostname`, the host name in `/etc/hosts` and the environment variable `HOSTNAME` all point to the same name.

### Kubernetes Installation

* Kubernetes 1.4.x, 1.5.x and 1.6.2+ are supported with the following instructions.
* ~Kubernetes versions 1.6.0 and 1.6.1 are not supported due to [this issue.](https://github.com/kubernetes/kubernetes/issues/44041)
* Install Kubernetes using [kubeadm](http://kubernetes.io/docs/getting-started-guides/kubeadm/):
  1. kubeadm installs the latest Kubernetes version. <br>
     * For Kubernetes 1.4, see an example script [here.](https://github.com/contiv/install/blob/master/cluster/k8s1.4/k8smaster.sh)
     * For Kubernetes 1.6.2+, see an example script [here.](https://github.com/contiv/install/blob/master/cluster/k8s1.6/k8smaster.sh)
  1. Replace step (3/4) in the kubeadm install guide with the following Contiv Installation Instructions. Contiv installation can be done after completing step (4/4) in the Kubeadm installation.
  1. Ensure that the master nodes have the `node-role.kubernetes.io/master` taint by running the following command.
  ```
  	kubectl describe nodes
  ```
  ~~Contiv master components are only run on nodes tainted with this annotation as described [here](https://github.com/contiv/install/blob/master/install/k8s/k8s1.6/contiv.yaml#L254-L258). If you are trying to run Contiv on a cluster where the master nodes are tainted differently, the node tolerations & nodeSelector fields need to be changed in all the yaml files in `install/k8s/k8s1.6` or `install/k8s/k8s1.4` folders.~~


## Contiv Installation

* Run the following commands from the Kubernetes master host.
* Use curl to get the installer bundle: <br>`curl -L -O https://github.com/contiv/install/releases/download/$VERSION/contiv-$VERSION.tgz`
* Extract the install bundle <br>`tar oxf contiv-$VERSION.tgz`.
* Change directories to the extracted folder <br>`cd contiv-$VERSION`
* To install Contiv with VXLAN:<br> `sudo ./install/k8s/install.sh -n $CONTIV_MASTER`
* **NOTE:** Use the same IP for CONTIV_MASTER as you use for --api-advertise-addresses in kubeadm init.
* To install Contiv specifying a data plane interface for VLAN:<br> `sudo ./install/k8s/install.sh -n $CONTIV_MASTER -v <data plane interface like eth1>`
* **NOTE:** Ensure that the data plane interface is the same on all the worker nodes.
* To install Contiv with ACI: <br>`./install/k8s/install.sh -n $CONTIV_MASTER -a <APIC URL> -u <APIC User> -p <APIC Password> -l <Leaf Nodes> -d <Physical Domain> -e <EPG Bridge domain> -m <APIC contracts unrestricted mode>
  ` <br> For example: <br> `./install/k8s/install.sh -n <netmaster DNS/IP> -a https://apic_host:443 -u apic_user -p apic_password -l topology/pod-xxx/node-xxx -d phys_domain -e not_specified -m no
  `
 <br> where `$CONTIV_MASTER` is the Contiv proxy or Net Master IP.
* To install Contiv with a custom infra network and gateway: <br>`./install/k8s/install.sh -n <netmaster DNS/IP> -g <GATEWAY IP> -i <SUBNET>`
* To see additional install options, run <br> `./install/ansible/install.sh`.

## Removing Contiv
* To uninstall Contiv, retaining the etcd state, run:<br>
`sudo ./install/k8s/uninstall.sh`
* To uninstall Contiv, cleaning up the etcd state, run:<br>
`sudo ./install/k8s/uninstall.sh etcd-cleanup`. <br>Use this option to cleanup all the Contiv network state. 
* To stop Contiv, go to the install folder contiv-$VERSION and run:<br> `kubectl delete -f .contiv.yaml`
* To start Contiv, go to the install folder contiv-$VERSION and run:<br> `kubectl apply -f .contiv.yaml`
* To remove etcd state when Contiv is stopped, run: <br> `rm -rf /var/etcd/contiv-data`
