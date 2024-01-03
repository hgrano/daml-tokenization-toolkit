#!/bin/bash

ENV=$DEPLOYMENT_GROUP_NAME
VERSION=$(xml_grep --text_only '/project/version' pom.xml)

echo "ENV = ${ENV}"
echo "VERSION = ${VERSION}"

s3_url_be="s3://dlts-artifacts/synfini-wallet-app/${ENV}/${VERSION}/application.properties /opt/app/config/${ENV}/${VERSION}"
s3_url_fe_investor="s3://dlts-artifacts/synfini-wallet-app/${ENV}/${VERSION}/.env.investor /opt/app/config/${ENV}/${VERSION}"
s3_url_fe_issuer="s3://dlts-artifacts/synfini-wallet-app/${ENV}/${VERSION}/.env.issuer /opt/app/config/${ENV}/${VERSION}"

aws s3 cp $s3_url_be
aws s3 cp $s3_url_fe_investor
aws s3 cp $s3_url_fe_issuer

echo "config files downloaded"

