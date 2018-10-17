# Berlioz Hello World v3.load-balancer

Third version of Hello World application. Very similar to [second version](../v2.second-service), except we provisioned a http load balancer in front of the web service.

![v3.load-balancer Screenshot](screenshot.png)

## Service Diagram
```
$ berlioz output-diagram
```
![v3.load-balancer Diagram](diagram.png)

## Running Locally

1. Navigate to sample directory
```
$ cd 01.HelloWorld.js/v3.load-balancer
```

2. Build and deploy the project
```
$ berlioz local build-run
```

3. Output service endpoint addresses
```
$ berlioz local endpoints
```

4. Once completed release local resources
```
$ berlioz local stop
```

## Deploying to AWS

1. Make sure that AWS account is linked and deployments were created. If not follow instructions [here](../../README.md).

2. Login the region in order to push images
```
$ berlioz login --region us-east-1
```

3. Build and push the project to berlioz
```
$ berlioz push --region us-east-1
```

4. Deploy the project to the test deployment
```
$ berlioz run --deployment test --cluster hello --region us-east-1
```

5. Check the deployment status. Proceed forward once completed.
```
$ berlioz status --region us-east-1
```

6. Output service endpoint addresses. This time the output will only have one
endpoint which would be the AWS load balancer.
```
$ berlioz endpoints --deployment test --region us-east-1
```

7. Once completed release AWS resources
```
$ berlioz stop --deployment test --cluster hello --region us-east-1
```


## Next Version
Navigate to [next version](../v4.dns) of HelloWorld sample were a public dns and the second load-balancer will be added.
