# Take nodejs image 
FROM    node:12.16.1

# Set working directory
WORKDIR   /app

# Copy the artefacts

COPY . /app

# RUN npm ci --only=production
RUN  npm install

# Port where your app will run
EXPOSE      3000

# Entry point that will start the service in Docker Container
ENTRYPOINT  ["npm", "start"]
