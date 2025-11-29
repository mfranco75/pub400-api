# Use Node.js 18 on Debian Bullseye (required for IBM i Access driver)
FROM node:18-bullseye

# Install system dependencies and tools
RUN apt-get update && apt-get install -y \
    unixodbc \
    unixodbc-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download and install IBM i Access Client Solutions - ODBC Driver via Repository
RUN curl https://public.dhe.ibm.com/software/ibmi/products/odbc/debs/dists/1.1.0/ibmi-acs-1.1.0.list -o /etc/apt/sources.list.d/ibmi-acs-1.1.0.list \
    && apt-get update \
    && apt-get install -y ibm-iaccess \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD [ "node", "index.js" ]
