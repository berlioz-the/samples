# Berlioz Pharmacy Demo

A model of a modern pharmacy application. All client request are entering through **web** service.

* A request to populate available medications go through **inventory** service directly to **drugs** DynamoDB table.
* A request to drop off prescription go to **clerk** service which puts a job message into **jobs** Kinesis queue.
* The **pharmacist** service reads from the **jobs** queue and notifies the **dashboard** service.
* The **dashboard** service inserts prepared prescriptions into **das** DynamoDB table.
* To render front page the **web** service queries **inventory** and **dashboard** services for list of available medications and the call board.

![Pharmacy Diagram](diagram.png)

## Running Locally

1. Prerequisites. If you haven't already installed **berlioz** command line tools and set up AWS account profile, run:
```
$ npm install berlioz -g
$ berlioz local account --profile <the-name-of-aws-profile-to-use>
```

2. Navigate to sample directory
```
$ cd 04.Pharmacy
```

3. Build and deploy the project
```
$ berlioz local build-run
```

4. Output service endpoint addresses
```
$ berlioz local endpoints
```

5. Once completed release AWS resources
```
$ berlioz local stop
```

## Deploying to AWS

1. Make sure that AWS account is linked and deployments were created. If not follow instructions [here](../README.md).


2. Login the region in order to push images
```
$ berlioz login
```

3. Build and push the project to berlioz
```
$ berlioz push --region us-east-1
```

4. Deploy the project to the test deployment
```
$ berlioz run --deployment test --cluster pharm --region us-east-1
```

5. Output service endpoint addresses
```
$ berlioz endpoints --deployment test --region us-east-1
```

6. Once completed release AWS resources
```
$ berlioz stop --deployment test --cluster pharm --region us-east-1
```
