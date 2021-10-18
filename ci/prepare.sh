docker run \
       --rm \
       --volume "$(pwd):/home/akvo-react-form" \
       --workdir "/home/akvo-react-form" \
       --entrypoint /bin/sh \
       node:lts-alpine3.13 -c 'npm install -g yarn & yarn install & yarn run build'
