# Berlioz Kinesis Demo

An application which performs ASCII art rendering in a batch mode using AWS Kinesis and DynamoDB.

![Kinesis Diagram](diagram.png)

## Running Locally

1. Navigate to sample directory
```
$ cd 03.Kinesis
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

1. Make sure that AWS account is linked and deployments were created. If not follow instructions [here](../README.md).

2. Build and push the project to berlioz
```
$ berlioz push
```

3. Deploy the project to the test deployment
```
$ berlioz run --deployment test --cluster kin --region us-east-1
```

4. Output service endpoint addresses
```
$ berlioz endpoints --deployment test
```

5. Once completed release AWS resources
```
$ berlioz stop --deployment test --cluster kin --region us-east-1
```
