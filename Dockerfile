# Use Node.js 18 on Debian Bullseye (required for IBM i Access driver)
FROM node:18-bullseye

# Install system dependencies and tools
RUN apt-get update && apt-get install -y \
    unixodbc \
    unixodbc-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download and install IBM i Access Client Solutions - ODBC Driver
# Using the public link for the Linux .deb package
RUN curl -L -o ibm-iaccess.deb https://public.dhe.ibm.com/software/ibmi/products/odbc/debs/ibm-iaccess-1.1.0.28-1.0.amd64.deb \
    && dpkg -i ibm-iaccess.deb \
    && rm ibm-iaccess.deb

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
