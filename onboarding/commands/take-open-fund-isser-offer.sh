#!/usr/bin/env bash

set -eu

$TOKENIZATION_UTIL/add-json.sh \
  $TOKENIZATION_PARTIES_FILE \
  $TOKENIZATION_SETTLEMENT_FACTORIES_FILE \
  $TOKENIZATION_FUND_ISSUER_OPEN_OFFERS_FILE \
  $1 \
  $TOKENIZATION_UTIL/daml-script.sh \
  --input-file /dev/stdin \
  --dar ${TOKENIZATION_ONBOARDING_DAR} \
  --script-name Synfini.Onboarding.Fund.OpenOffer:createFund \
  "${@:2}"
