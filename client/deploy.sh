#!/bin/bash
npm run build
mv build client
cp -r client ../mystash
