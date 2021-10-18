publish() {
    docker run \
           --rm \
           --volume "$(pwd):/home/akvo-react-form" \
           --workdir "/home/akvo-react-form" \
           --entrypoint /bin/sh \
           node:lts-alpine3.13 -c "npm config set '//registry.npmjs.org/:_authToken' ${NPM_PUBLISH_TOKEN} && npm publish"
}

check_version() {
    LAST_VERSION=$(npm info 'akvo-react-form' version)
    NEW_VERSION=$(echo "$CI_TAG" | sed "s/v//g")
    if [[ "$LAST_VERSION" != "$NEW_VERSION" ]]; then
        echo "PUBLISHING $CI_TAG"
        publish
    else
        echo "SKIP PUBLISHING $CI_COMMIT"
    fi
}

if [[ "${CI_TAG:=}" =~ v.* ]]; then
    check_version
    exit 0
fi

echo "$CI_COMMIT - NOTHING TO PUBLISH"
