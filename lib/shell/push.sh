#!/usr/bin/env bash

if ! [ -x "$(command -v git)" ]; then
  echo 'Error: git is not installed.' >&2
  exit 1
fi

if [ -z "$1" ]; then
    echo -e "\033[46;30m Write your commit noted \033[0m"
    exit
fi
echo -e "\033[46;30m Your commit message is: "$1" \033[0m"

branch=$2
if [ -z "$2" ]; then
    branch="$(git rev-parse --abbrev-ref HEAD)"
fi
echo -e "\033[46;30m Your branch is: $branch \033[0m"


depository=$3
if [ -z "$3" ]; then
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
git add .
git commit -m "$1"
git push "$depository" "$branch"
echo -e "\033[46;30m exec done \033[0m"


# if [ "$?" -eq "0" ]
# then
#   echo -e "\033[46;30m push success \033[0m"
# else
#   echo -e "\033[46;30m push failed \033[0m"
# fi 