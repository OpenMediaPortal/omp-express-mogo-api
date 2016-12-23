FROM node:slim

RUN mkdir -p /omp
WORKDIR /omp

# Install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
ENV PATH="/root/.yarn/bin:${PATH}"
# Install pm2
RUN yarn global add pm2

# Install dependencies
COPY ./package.json ./package.json
RUN yarn --production && \
    rm ./package.json

# The rest of the code will be mounted as a volume
CMD ["/bin/false"]
