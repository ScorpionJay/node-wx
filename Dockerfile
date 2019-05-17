FROM hub.c.163.com/nce2/nodejs

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app
RUN cd /app
RUN npm install

# Make port 80 available to the world outside this container
EXPOSE 9999

# Define environment variable
# ENV NAME World

# Run npm run dev when the container launches
# CMD ["npm","run","dev"]
CMD ["npm","start"]