#!/bin/sh

if [[ "${example_cisco}" == "true" ]]; then
    cd example_cisco
    yarn install
    yarn start-ssl
else
    yarn install
    yarn start
fi
