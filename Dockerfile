FROM node:slim

RUN mkdir -p /omp
WORKDIR /omp

# Install dependencies
COPY ./package.json ./package.json
RUN npm install --production && \
    rm ./package.json

# The rest of the code will be mounted as a volume
CMD ["/bin/false"]
