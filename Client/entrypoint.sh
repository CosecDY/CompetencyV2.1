#!/bin/sh
cp -r /tmp/dist/* /usr/share/nginx/html/
nginx -g "daemon off;"