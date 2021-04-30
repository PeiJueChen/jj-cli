if ! [ -x "$(command -v git)" ]; then
    echo 'Error: git is not installed.' >&2
    exit 1
fi

if [[ -z $(git status -s) ]]; then
    echo "tree is clean"
else
    echo -e "\033[36;1m tree is dirty, please commit changes before running this \033[0m"
    exit 1
fi

version="$1"
if [ -z "$version" ]; then
    branch="$(git rev-parse --abbrev-ref HEAD)"
    version=$branch-"$(date +'%Y-%m-%d-%H%M%S')"
    echo -e "\033[46;30m making tag: $version \033[0m"
else
    echo -e "\033[46;30m using tag: $version \033[0m"
fi


depository=$2
if [ -z "$2" ]; then
    d="$(git remote -v)"
    depository=($(echo $d | tr ',' ' '))
    if [ -z $depository ]; then
        echo -e "\033[36;1m Not match depository \033[0m"
        depository="origin"
    fi
fi

echo -e "\033[46;30m Your depository is: $depository \033[0m"

echo -e "\033[30;43m git push tag... \033[0m"
git push $depository $version
