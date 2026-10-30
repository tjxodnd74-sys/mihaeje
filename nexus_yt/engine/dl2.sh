#!/bin/bash
while [ $# -gt 1 ]; do k=$(( $1 / 10 )); t=$(( $1 % 10 )); curl -sS -o ln2/u${k}_$t.wav "$2"; shift 2; done; ls ln2 | wc -l
