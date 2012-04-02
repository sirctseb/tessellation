#!/bin/bash
sass --watch sass:./ & P1=$!
coffee --watch --compile --output ./ coffee & P2=$!
# kill watchers when we kill the script
trap "kill $P1; kill $P2" INT
wait