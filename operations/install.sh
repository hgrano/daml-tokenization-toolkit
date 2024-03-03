#!/usr/bin/env bash

set -e

DOPS_HOME=~/.dops
rm -rf $DOPS_HOME
mkdir $DOPS_HOME
mkdir $DOPS_HOME/bin
mkdir $DOPS_HOME/scripts
cp $DOPS_DAR ${DOPS_HOME}/dops.dar
cp -r commands $DOPS_HOME/scripts/
cp -r util $DOPS_HOME/scripts/
cp main.sh $DOPS_HOME/bin/dops