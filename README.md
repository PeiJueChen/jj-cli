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
* For: cordova app / capacitor app

```ruby

    j open ios
    j open android
    
```

## Usage upload ios/platform to appcenter
* For: cordova app / capacitor app
* Before using, make sure that there is .apk/.ipa under the ios/android folder , Or set your apppath:  `--apppath: xxxxx(./)`

```ruby

    j upload android -n <appcenter release notes> -path xxxx
    j upload ios -n <appcenter release notes> -path xxxx
    j appcenter login
    j appcentet logout
    
```

## Usage template
* node
* python xxx(project name)
* -pn : Set your project name
* -fp / --folderpath: Set your folder path.
  
```ruby

    j create node 
    j create node -fp xxxxxx
    j create python xxxx(project name)
    j create python xxxx -fp xxxxxx
```

## Usage preview 
* Help you run a local service 
* j preview 
* -host:                default is localhost
* -port:                default is 5000
* -staticFolderName:    default is dist 

```ruby

    j preview
    j preview -host 192.168.3.2
    j preview -port 5888
```

## Usage ip
* Get the IP address of your pc/mac

```ruby

    j ip
``` 
