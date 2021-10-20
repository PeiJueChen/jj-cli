if [ -z "$1" ]; then
    echo -e "\033[46;30m Set Your Version \033[0m"
    exit 1
fi

pLock="./package-lock.json"
package="./package.json"

gradle="./android/app/build.gradle"
versionP="s/\"version\": \".*\"/\"version\": \"$1\"/g"
pDebug="s/\"debug\": .*/\"debug\": false,/g"
versionPL="s/^  \"version\": \".*\"/  \"version\": \"$1\"/g"
sed -i '' "$versionP" "$package"
sed -i '' "$pDebug" "$package"
sed -i '' "$versionPL" "$pLock"
echo -e "\033[46;30m Your Version No Is: "$1" \033[0m"
