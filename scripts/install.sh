#!/bin/bash

# Install the dependencies
npm in

# Install the service

# Duplicate the service file
cp fizo202.service fizo202.service.bak

# Replace __user with the current user
sed -i "s/__user/$USER/g" fizo202.service

# Copy the service file to the systemd directory
sudo cp fizo202.service /etc/systemd/system/

# Restore the original service file
mv fizo202.service.bak fizo202.service

# Reload systemd manager configuration and start the service
sudo systemctl daemon-reload
sudo systemctl enable --now fizo202.service
