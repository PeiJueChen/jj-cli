#!/usr/bin/env bash

if [ -z "$1" ]; then
    echo -e "\033[46;30m Write your commit noted \033[0m"
    exit
fi

branch=$2
if [ -z "$2" ]; then
    branch="$(git rev-parse --abbrev-ref HEAD)"
    echo -e "\033[46;30m Your current branch is: $branch \033[0m"
fi

git add .
echo "commit message: $1" 
git commit -m "$1"
git push origin "$branch"
echo -e "\033[46;30m push success \033[0m"
