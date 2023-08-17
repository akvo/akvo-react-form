#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

if [[ "${CI_BRANCH}" != poc-* ]]; then
    exit 0
fi


docker run \
       --rm \
       --volume "$(pwd):/home/akvo-react-form" \
       --workdir "/home/akvo-react-form" \
       --entrypoint /bin/sh \
       node:14-alpine3.13 -c 'yarn install && cd example && yarn install && yarn build'

ssh -i "${SITES_SSH_KEY}" -o BatchMode=yes \
    -p 18765 \
    -o UserKnownHostsFile=/dev/null \
    -o StrictHostKeyChecking=no \
    u7-nnfq7m4dqfyx@35.214.170.100 "mkdir -p www/akvo-react-form.tc.akvo.org/public_html/${CI_BRANCH}/"

rsync \
    --archive \
    --compress \
    --progress \
    --exclude=ci \
    --exclude=node_modules \
    --rsh="ssh -i ${SITES_SSH_KEY} -o BatchMode=yes -p 18765 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no" \
    example/build/* u7-nnfq7m4dqfyx@35.214.170.100:/home/customer/www/akvo-react-form.tc.akvo.org/public_html/${CI_BRANCH}/
