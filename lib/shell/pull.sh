#!/usr/bin/env bash

if ! [ -x "$(command -v git)" ]; then
    echo 'Error: git is not installed.' >&2
    exit 1
fi

branch=$1
if [ -z "$1" ]; then
    branch="$(git rev-parse --abbrev-ref HEAD)"
fi
echo -e "\033[46;30m Your branch is: $branch \033[0m"

depository=$2
if [ -z "$2" ]; then
    d="$(git remote -v)"
    depository=($(echo $d | tr ',' ' '))
    echo -e "Found depository: "$depository""
    if [ -z $depository ]; then
        echo -e "\033[36;1m Not match depository \033[0m"
        depository="origin"
    fi
fi
echo -e "\033[46;30m Your depository is: $depository \033[0m"
echo -e "\033[30;43m ----------------------------------------------- \033[0m"
echo -e "\033[46;30m loading... \033[0m"

git fetch "$depository"

git pull "$depository" "$branch"

echo -e "\033[46;30m exec Done \033[0m"

# if [ "$?" -eq "0" ]
# then
#   echo -e "\033[46;30m Exec success \033[0m"
# else
#   echo -e "\033[46;30m Exec failed \033[0m"
# fi
