package main

import (
	"fmt"
	"os"
	"os/exec"
	// "strconv"
	"time"

	"github.com/berlioz-the/connector-go"
)

const redisConfFile = "/etc/redis.conf"

var configContents = make(map[string]string)
var isConfigReady = false
var isSelfDefaultPresent = false
var isSelfGossipPresent = false

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func checkConfigReady() {
	if isConfigReady {
		return
	}

	if isSelfDefaultPresent && isSelfGossipPresent {
		isConfigReady = true
	}

	if !isConfigReady {
		return
	}

	fmt.Printf("**** CONFIG IS READY: %#v\n", configContents)

	saveConfig()

	startRedis()
}

func saveConfig() {
	f, err := os.Create(redisConfFile)
	check(err)

	defer f.Close()

	for k, v := range configContents {
		f.WriteString(k + " " + v + "\n")
	}

	f.Sync()
}

func startRedis() {
	fmt.Printf("**** STARTING REDIS\n")

	cmd := exec.Command("docker-entrypoint.sh", "redis-server", redisConfFile)
	cmd.Stdout = os.Stdout
	err := cmd.Start()
	if err != nil {
		fmt.Printf("**** ERROR STARTING REDIS: %#v\n", err)
		os.Exit(1)
	}
	fmt.Printf("**** STARTED REDIS. Pid: %d\n", cmd.Process.Pid)
	// runningCommands = append(runningCommands, cmd)
}

func forever() {
	for {
		// fmt.Printf("%v+\n", time.Now())
		time.Sleep(time.Second)
	}
}

func main() {

	configContents["port"] = "6379"
	configContents["cluster-enabled"] = "yes"
	configContents["cluster-config-file"] = "nodes.conf"
	configContents["cluster-node-timeout"] = "5000"
	configContents["appendonly"] = "yes"

	var myIdentity = os.Getenv("BERLIOZ_IDENTITY")
	var myService = os.Getenv("BERLIOZ_SERVICE")

	berlioz.MyEndpoint("default").Monitor(func(ep berlioz.EndpointModel) {
		fmt.Printf("**** MONITOR DEFAULT EP: %#v. Present: %t\n", ep, ep.IsPresent())
	})

	berlioz.MyEndpoint("gossip").Monitor(func(ep berlioz.EndpointModel) {
		fmt.Printf("**** MONITOR GOSSIP EP: %#v. Present: %t\n", ep, ep.IsPresent())
	})

	berlioz.Service(myService).MonitorAll(func(peers map[string]interface{}) {
		fmt.Printf("***** UPDATED DEFAULT PEERS: %#v\n", peers)
		if !isSelfDefaultPresent {
			if selfPeerObj, ok := peers[myIdentity]; ok {
				fmt.Printf("***** UPDATED DEFAULT SELF PEER: %#v\n", selfPeerObj)

				selfPeer := selfPeerObj.(map[string]interface{})
				configContents["cluster-announce-ip"] = fmt.Sprintf("%v", selfPeer["address"])
				configContents["cluster-announce-port"] = fmt.Sprintf("%v", selfPeer["port"])

				isSelfDefaultPresent = true
				checkConfigReady()
			}
		}
	})

	berlioz.Service(myService).Endpoint("gossip").MonitorAll(func(peers map[string]interface{}) {
		fmt.Printf("***** UPDATED GOSSIP PEERS: %#v\n", peers)
		if !isSelfGossipPresent {
			if selfPeerObj, ok := peers[myIdentity]; ok {
				fmt.Printf("***** UPDATED GOSSIP SELF PEER: %#v\n", selfPeerObj)

				selfPeer := selfPeerObj.(map[string]interface{})
				configContents["cluster-announce-bus-port"] = fmt.Sprintf("%v", selfPeer["port"])

				isSelfGossipPresent = true
				checkConfigReady()
			}
		}
	})

	forever()
}
