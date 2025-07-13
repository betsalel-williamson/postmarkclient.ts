#!/usr/bin/env sh

grep -o "{{[^}]*}}" "$1" | sort -u
