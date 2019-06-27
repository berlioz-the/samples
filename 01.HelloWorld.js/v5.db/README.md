# Berlioz Hello World v5.db

Fifth version of Hello World application. Compared with the
[fourth version](../v4.dns) adding third service: self-hosted **mysql**
database. For the **db** service we defined that it would need a 1GB of storage and that storage should be mapped to _/var/lib/mysql_.

Also, we removed the load-balancer which was in front of the **app**
service. To make it more interesting we made a contact list application.

Please note that even though in this example there are three tiers: web, app and db, we by no means are promoting a monolithic application architectures.
With berlioz it is a trivial task to define
per-domain/per-feature app, db, etc services.
For more complex cases please checkout further samples.    

The screenshot below shows how the **web** and **app** endpoints discovered their peers.
![v5.db Screenshot](screenshot.png)

## Service Diagram
```
$ berlioz output-diagram
```
![v5.db Diagram](diagram.png)

## Running Locally

1. Navigate to sample directory
```
$ cd 01.HelloWorld.js/v5.db
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
$ berlioz login
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

6. Output service endpoint addresses.
```
$ berlioz endpoints --deployment test --region us-east-1
```

7. Once completed release AWS resources
```
$ berlioz stop --deployment test --cluster hello --region us-east-1
```

## Next
This was the last change we planned for Hello World sample.
Now you're ready for more [advanced samples](../../02.DynamoDB) scenarios using AWS native services.
