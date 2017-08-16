---
layout: "documents"
page_title: "System Requirements"
sidebar_current: "install"
description: |-
  System Requirements
---

# System Requirements

Contiv can be run in a single master or multi-master configuration. Please refer to the Orchestrator specific hardware/software requirements.

For VXLAN mode, Contiv needs a single NIC on the nodes .
For VLAN mode, Contiv needs one NIC for the control plane and one NIC for the data plane.

For detailed topology configuration requirements, refer to the specific [configuration](config/index.md) pages.


# Guest Operating Systems

Contiv is currently supported on CentOS 7.x and RHEL 7.x, with community support available for Ubuntu 16.04+
