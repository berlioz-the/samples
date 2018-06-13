# Berlioz Hello World v1.basic

Initial version of Hello World application. Nothing fancy, just a single **web**
service. When deployed to local workstation should look somewhat like the
screenshot below. Environment variables would be different when deployed to
AWS.
![v1.basic Screenshot](screenshot.png)

## Service Diagram
```
$ berlioz output-diagram
```
![v1.basic Diagram](diagram.png)

## Running Locally

1. Navigate to sample directory
```
$ cd 01.HelloWorld/v1.basic
```

2. Build and deploy the project
```
$ berlioz local push-run
```

3. Output service endpoint addresses
```
$ berlioz local endpoints
```

4. Once completed release AWS resources
```
$ berlioz local stop
```

## Deploying to AWS

1. Make sure that AWS account is linked and deployments were created. If not follow instructions [here](../../README.md).

2. Build and push the project to berlioz
```
$ berlioz push
```

3. Deploy the project to the test deployment
```
$ berlioz run --deployment test --cluster hello --region us-east-1
```

4. Check the deployment status. Proceed forward once completed.
```
$ berlioz status
```

5. Output service endpoint addresses
```
$ berlioz endpoints --deployment test
```

6. Once completed release AWS resources
```
$ berlioz stop --deployment test --cluster hello --region us-east-1
```

## Next Version
Navigate to [next version](../v2.second-service) of HelloWorld sample were the second **app** service will be added.
