FROM nginx:alpine

# Copy the pre-built React app (built in CI) to Nginx's web root
COPY dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
