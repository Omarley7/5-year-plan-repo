FROM nginx:1.27-alpine

COPY index.html manifest.json sw.js icon.svg icon-192.png icon-512.png apple-touch-icon.png /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/

EXPOSE 80
