# Base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose the port the service runs on
EXPOSE 3000

# Start the server
CMD ["npm", "start"]