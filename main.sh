#!/bin/sh

if [[ "${example}" == "true" ]]; then
    cd example
    yarn install
    yarn start-ssl
else
    yarn install
    yarn start
fi
