#!/bin/bash

cd /home/user/fizo202
git pull
npm ci
npm run build

sudo systemctl restart fizo202