# Use node.js 10.9 running on Alpine Linux
FROM node:10.9-alpine

# Create the solution directory structure in the container
RUN mkdir -p /usr/src/zz-demo/packages
RUN mkdir -p /usr/src/zz-demo/solution/data
RUN mkdir -p /usr/src/zz-demo/solution/api/zz

WORKDIR /usr/src/zz-demo

# Copy solution files into container
COPY package.json .
COPY lerna.json .
COPY packages ./packages
COPY solution/data ./solution/data
COPY solution/api/zz ./solution/api/zz

# Install dependencies as a "layer" in docker image
RUN yarn bootstrap

# And then remove all globally-cached copies of dependencies
# Is this such a good idea?
# RUN yarn cache clean

# Copy source code into image as another "layer"
# COPY . .

# Expose API port to the outside
EXPOSE 443

WORKDIR /usr/src/zz-demo/solution/api/zz

# Launch API server
# CMD ["yarn","dev:quiet"]
# CMD ["yarn","start:noclient"]
CMD ["yarn","start"]
