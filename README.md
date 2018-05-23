# Berlioz Samples
The purpose of this repository is to present capabilities of [Berlioz](https://berlioz.cloud) the microservices provisioning, deployment and orchestration service for AWS.

The repo is structured in chapters, starting with trivial samples to more complex applications.

## Prerequisites
First, install _berlioz_ command line toolkit.
```
$ npm install berlioz -g
```

## Running Samples Locally
1. Navigate to sample directory
```
$ cd 01.HelloWorld/v1.basic
```

2. Build and deploy the project
```
$ berlioz local push-provision
```

3. Output service endpoint addresses
```
$ berlioz local endpoints
```

4. Open the endpoint in the browser: http://localhost:40000 (use the port returned from the step 3).

## Running Samples in AWS

### Account Setup
1. Sign-up and login to AWS.
2. Create AWS access key. For details see the guide [here](https://github.com/berlioz-the/samples/blob/master/docs/aws.md).
3. Sign-up to Berlioz:
```
$ berlioz signup
```
4. Link AWS account to Berlioz:
```
$ berlioz provider create --name myaws --kind aws --key <key> --secret <secret>
```
5. Create deployments for production and test:
```
$ berlioz deployment create --name prod --provider myaws --region us-east-1
$ berlioz deployment create --name test --provider myaws --region us-east-1
```

### Deploying the sample to AWS
1. Navigate to sample directory
```
$ cd 01.HelloWorld/v1.basic
```

2. Build and push the project to berlioz
```
$ berlioz push
```

3. Deploy the project to the test deployment
```
$ berlioz provision --deployment test
```

4. Output service endpoint addresses
```
$ berlioz endpoints --deployment test
```

5. Open the endpoint in the browser: http://1.2.3.4:12345 (use the address and port returned from the step 4).


## Service Diagrams
The berlioz comes with graphical diagram generation tool. To generate a diagram simply:

```
$ cd 02.DynamoDB
$ berlioz output-diagram
```

Will generate a diagram like this:
![DynamoDB Sample Diagram](https://github.com/berlioz-the/samples/blob/master/02.DynamoDB/diagram.png)

or for a more complex project:
```
$ cd 02.Pharmacy
$ berlioz output-diagram
```
![Pharmacy Semo Diagram](https://github.com/berlioz-the/samples/blob/master/04.Pharmacy/diagram.png)
