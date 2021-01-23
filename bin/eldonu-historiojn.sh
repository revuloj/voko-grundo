#!/bin/bash

# sendi artikol-kronikojn al la publika servilo....

#host=retavortaro.de
host=revo
revo=${host}:www/revo

scp $* ${revo}/hst/

