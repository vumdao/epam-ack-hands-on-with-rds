#!/bin/bash
# Best practice is to protect the RDS user password

export RDS_DB_USERNAME=rds_dev_master
export RDS_DB_PASSWORD=rds_password

kubectl create secret generic rds-postgresql-user-creds \
  --from-literal=username="${RDS_DB_USERNAME}" \
  --from-literal=password="${RDS_DB_PASSWORD}"

