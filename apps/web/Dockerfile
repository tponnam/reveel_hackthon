FROM mcr.microsoft.com/playwright:v1.58.2-jammy

# Install FFmpeg for video generation assembly
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies exactly
RUN npm ci

# Copy the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the Next.js production port
EXPOSE 3000

# Set environment variables for Next.js standalone mode (or standard start)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Node.js process
CMD ["npm", "start"]
