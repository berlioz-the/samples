#!/bin/bash

echo "RUNNING: ls -la /var/lib/mysql"
ls -la /var/lib/mysql

echo "RUNNING ORIGINAL docker-entrypoint.sh"
/usr/local/bin/docker-entrypoint.sh
