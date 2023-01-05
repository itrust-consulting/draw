#!/bin/sh
echo "Switching to test automation directory"
cd draw/test_automation
echo "Creating the download and logging directory"
mkdir -p download  testlogging
echo "Running tests.."
rcc run
echo "Done Running tests.."