#!/bin/bash
npm run build
rm -rf ../build
mv build ../
