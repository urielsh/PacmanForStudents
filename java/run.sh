#!/bin/bash
cd "$(dirname "$0")" && mvn -q compile exec:java -Dexec.mainClass="com.packman.PacmanGame"
