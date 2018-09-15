# Use node.js running on Alpine Linux w/ Yarn installed
FROM node:10.10-alpine

# Create the solution folder in the container
RUN mkdir -p /usr/src/zz-demo

# ...and use it as our working directory for now
WORKDIR /usr/src/zz-demo

# Copy solution files into container
COPY package.json .
COPY lerna.json .
COPY packages ./packages
COPY solution/admin ./solution/admin
COPY solution/data ./solution/data
COPY solution/api/zz ./solution/api/zz

# Install dependencies and cleanup
RUN yarn bootstrap && yarn cache clean

# Expose API port to the outside
EXPOSE 443

# Set run-time working directory
WORKDIR /usr/src/zz-demo/solution/api/zz

# Launch API server
CMD ["yarn","start"]
