process.env = {
    "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    "HOSTNAME": "d547ce07a0f7",
    "BERLIOZ_INSTANCE_ID": "",
    "BERLIOZ_SERVICE": "web",
    "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI": "/v2/credentials/b50d0850-4488-4632-9646-9e291623a592",
    "ECS_CONTAINER_METADATA_URI": "http://169.254.170.2/v3/63c9ac84-aac3-495b-baec-ccf664b6e00c",
    "AWS_EXECUTION_ENV": "AWS_ECS_EC2",
    "BERLIOZ_IDENTITY": "${HOSTNAME}",
    "BERLIOZ_INFRA": "aws",
    "BERLIOZ_ADDRESS": "0.0.0.0",
    "BERLIOZ_LISTEN_ADDRESS": "0.0.0.0",
    "BERLIOZ_PROVIDED_PORT_DEFAULT": "3000",
    "BERLIOZ_REGION": "us-west-2",
    "BERLIOZ_SECTOR": "main",
    "BERLIOZ_TASK_ID": "",
    "BERLIOZ_AGENT_PATH": "ws://172.17.0.1:55555/${HOSTNAME}",
    "BERLIOZ_CLUSTER": "hello",
    "BERLIOZ_LISTEN_PORT_DEFAULT": "3000",
    "NODE_VERSION": "10.14.1",
    "YARN_VERSION": "1.12.3",
    "HOME": "/root"
}

var index = require('./src');