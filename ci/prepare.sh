docker run \
       --rm \
       --volume "$(pwd):/home/akvo-react-form" \
       --workdir "/home/akvo-react-form" \
       --entrypoint /bin/sh \
       node:14-alpine3.13 -c './build.sh'
