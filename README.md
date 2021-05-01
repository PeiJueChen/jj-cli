# jj-cli
> A Tool CLI

## Install

```ruby
    npm i jj-cli -g
```

## Usage git 

```ruby
    j -h (help)
    j gpush <messgae> -b [branch] -d [depository]
    j gpull -b [branch] -d [depository]
    j gtag [tagName] -d [depository]
```

## Usage open ios/platform
* for: cordova app / capacitor app

```ruby

    j open ios
    j open android
    
```

## Usage upload ios/platform
* for: cordova app / capacitor app
* Before using, make sure that there is .apk/.ipa under the ios/android folder , Or set your apppath:  --apppath: xxxxx(./)

```ruby

    j upload android -n <appcenter release notes> -path xxxx
    j upload ios -n <appcenter release notes> -path xxxx
    j appcenter login
    j appcentet logout
    
```