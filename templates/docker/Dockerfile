# create a new docker container based on the latest wordpress docker image
FROM wordpress:latest

# update the docker container
RUN apt-get -y update

# install international components for unicode
RUN apt-get -y install libicu-dev

# install php intl extension
RUN docker-php-ext-configure intl
RUN docker-php-ext-install intl