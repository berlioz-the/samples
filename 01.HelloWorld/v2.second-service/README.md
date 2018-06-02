# Berlioz Hello World v2.second-service

Second version of Hello World application. We added the **app** service. The **web** service communicates with the **app** service. When deployed to local workstation should look somewhat like the
screenshot below. The green box on the right shows list of **app** peers. The **web** services makes an HTTP request to a random **app** peer and outputs the response in the bottom box. This is effectively a load-balancing without any load-balancer device.

![v2.second-service Screenshot](screenshot.png)

## Running Locally

1. Navigate to sample directory
```
$ cd 01.HelloWorld/v2.second-service
```

2. Build and deploy the project
```
$ berlioz local push-provision
```

3. Output service endpoint addresses
```
$ berlioz local endpoints
```

4. Change the number of app service instances running
```
$ berlioz local scale set --cluster hello --service app --value 3
```

5. Once completed release AWS resources
```
$ berlioz local unprovision
```

## Deploying to AWS

1. Make sure that AWS account is linked and deployments were created. If not follow instructions [here](../../README.md).

2. Build and push the project to berlioz
```
$ berlioz push
```

3. Deploy the project to the test deployment
```
$ berlioz provision --deployment test --cluster hello --region us-east-1
```

4. Change the number of running **app** service instances
```
$ berlioz scale set --deployment test --cluster hello --region us-east-1 --service app --value 3
```

5. Check the deployment status. Proceed forward once completed.
```
$ berlioz deployment status
```

6. Output service endpoint addresses
```
$ berlioz endpoints --deployment test
```

7. Once completed release AWS resources
```
$ berlioz unprovision --deployment test --cluster hello --region us-east-1
```

## Service Diagram
```
$ berlioz output-diagram
```
![v2.second-service Diagram](diagram.png)
