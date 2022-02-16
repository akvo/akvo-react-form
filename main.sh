#!/bin/sh

if [[ "${example}" == "true" ]]; then
    cd example
fi

yarn install
yarn start
