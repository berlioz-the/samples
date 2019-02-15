#!/bin/bash

echo "RUNNING: ls -la /var/lib/mysql"
ls -la /var/lib/mysql

# FOR DEMO PURPOSES
# echo "RUNNING: rm -rf /var/lib/mysql/*"
# rm -rf /var/lib/mysql/*

echo "RUNNING ORIGINAL docker-entrypoint.sh $@"
/usr/local/bin/docker-entrypoint.sh mysqld $@
