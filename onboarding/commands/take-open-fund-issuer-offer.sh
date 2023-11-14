#!/usr/bin/env bash

set -eu

$DOPS_UTIL/add-json.sh \
  $DOPS_PARTIES_FILE \
  $DOPS_SETTLEMENT_FACTORIES_FILE \
  $DOPS_FUND_ISSUER_OPEN_OFFERS_FILE \
  $1 | \
  $DOPS_UTIL/daml-script.sh \
  --input-file /dev/stdin \
  --dar ${DOPS_DAR} \
  --script-name Synfini.Onboarding.Fund.OpenOffer:createFundOffer \
  "${@:2}"