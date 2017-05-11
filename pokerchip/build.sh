#! /bin/bash

for I in 1 5 10 25 100; do
  openjscad main.jscad --denom $I -o denom-$I-pokerchip.stl
done
