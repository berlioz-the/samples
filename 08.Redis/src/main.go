package main

import (
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"time"

	"github.com/berlioz-the/connector-go"
)

const redisConfFile = "/etc/redis.conf"

var configContents = make(map[string]string)
var isConfigReady = false
var isSelfDefaultPresent = false
var isSelfGossipPresent = false
var isClusterDeployed = false

var replicaCount = 0
var myIdentity = ""
var myService = ""

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

func setupCluster() {
	if isClusterDeployed {
		return
	}

	var peers = berlioz.Service(myService).All()
	fmt.Printf("***** SETUP CLUSTER PEERS: %#v\n", peers)

	var requiredCount = (replicaCount + 1) * 3
	if len(peers) >= requiredCount {

		var commandArray []string
		commandArray = append(commandArray, "ruby")
		commandArray = append(commandArray, "/var/local/redis/redis-trib.rb")
		commandArray = append(commandArray, "create")
		commandArray = append(commandArray, "--replicas")
		commandArray = append(commandArray, fmt.Sprintf("%v", replicaCount))
		for _, v := range peers {
			selfPeer := v.(map[string]interface{})
			var peerArg = fmt.Sprintf("%v:%v", selfPeer["address"], selfPeer["port"])
			commandArray = append(commandArray, peerArg)
		}

		fmt.Printf("***** SETUP CLUSTER COMMAND: %#v\n", commandArray)

		fmt.Printf("**** CONFIGURING CLUSTER\n")
		cmd := exec.Command(commandArray[0], commandArray[1:]...)
		cmd.Stdout = os.Stdout
		err := cmd.Start()
		if err != nil {
			fmt.Printf("**** ERROR CONFIGURING CLUSTER: %#v\n", err)
		}

		isClusterDeployed = true
	}
}

func forever() {
	for {
		// fmt.Printf("%v+\n", time.Now())
		time.Sleep(time.Second)
	}
}

func main() {

	myIdentity = os.Getenv("BERLIOZ_IDENTITY")
	myService = os.Getenv("BERLIOZ_SERVICE")
	if val, err := strconv.Atoi(os.Getenv("replica_count")); err == nil {
		replicaCount = val
	}

	fmt.Printf("**** REPLICA COUNT: %v\n", replicaCount)

	configContents["port"] = "6379"
	configContents["cluster-enabled"] = "yes"
	configContents["cluster-config-file"] = "nodes.conf"
	configContents["cluster-node-timeout"] = "5000"
	configContents["appendonly"] = "yes"

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

		setupCluster()
	})

	forever()
}
