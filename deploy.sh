#!/bin/bash
directory=build
branch=gh-pages
build_command() {
  npm run build
}

echo -e "\033[0;32mDeleting existing $branch...\033[0m"
git push origin --delete $branch
git branch -D $branch

echo -e "\033[0;32mSetting up new $branch branch\033[0m"
git checkout --orphan $branch
git reset --hard
git commit --allow-empty -m "Init"
git checkout master

echo -e "\033[0;32mGenerating site...\033[0m"
build_command
cp .gitignore ./build

git checkout $branch

touch .nojekyll
cd build/ &&
cp -R * ../ &&
cp .gitignore ../ &&
git add --all &&
git commit -m "Deploy updates" &&
git push origin gh-pages