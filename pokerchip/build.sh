#! /bin/bash

mkdir -p _output
for I in 1 5 10 25 100; do
  openjscad main.jscad --denom $I -o _output/denom-$I-pokerchip.stl
done
