# Use node.js running on Alpine Linux w/ Yarn installed
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

# Install dependencies and cleanup
RUN yarn bootstrap && yarn cache clean

# Expose API port to the outside
EXPOSE 443

WORKDIR /usr/src/zz-demo/solution/api/zz

# Launch API server
CMD ["yarn","start"]
