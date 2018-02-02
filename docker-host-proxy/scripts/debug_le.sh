#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")/.."

sudo docker-compose run --rm le
