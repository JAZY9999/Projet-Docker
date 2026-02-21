#!/bin/sh
export MYSQL_PASSWORD=$(cat /run/secrets/db_password)

exec node server.js
