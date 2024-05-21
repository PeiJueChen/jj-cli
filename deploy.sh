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

version="$(git describe --exact-match --tags HEAD)"
branch="$(git rev-parse --abbrev-ref HEAD)"

if [ -z "$version" ]; then
    version=$branch-"$(date +'%Y-%m-%d-%H%M%S')"
    echo "making new version " $version
else
    echo "using old version " $version
fi

sh build.sh

echo "tagging " $version

git tag $version

d="$(git remote -v)"
depository=($(echo $d | tr ',' ' '))
echo -e "Found depository: "$depository""
if [ -z $depository ]; then
    echo -e "match depository"
    depository="origin"
fi

echo "git push tag"
git push $depository $version

echo -e "\033[46;30m push tag done \033[0m"

echo -e "\033[30;43m ----------------------------------------------- \033[0m"

echo -e "\033[46;30m begin publish... \033[0m"
npm publish

echo -e "\033[46;30m exec done \033[0m"
