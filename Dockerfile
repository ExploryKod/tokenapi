# Use the official Node.js image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Expose the port on which your API will run (make sure it matches the one in your server.js)
EXPOSE 5321

# Set environment variables (replace "your_secret_key_here" with your actual secret key)
ENV API_KEY=1234567890abcdef
ENV PORT=5320

# Build and start the application using npm start
CMD ["npm", "start"]
