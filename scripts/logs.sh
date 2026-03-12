#!/bin/bash

if [ -z "$1" ]; then
    echo "Ver logs de todos os serviços"
    docker-compose logs -f
else
    echo "Ver logs de: $1"
    docker-compose logs -f "$1"
fi
