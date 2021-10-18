docker run \
       --rm \
       --volume "$(pwd):/home/akvo-react-form" \
       --workdir "/home/akvo-react-form" \
       --entrypoint /bin/sh \
       node:lts-alpine3.13 -c "npm config set '//registry.npmjs.org/:_authToken' ${NPM_PUBLISH_TOKEN} && npm publish"
