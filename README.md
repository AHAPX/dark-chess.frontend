# frontend for dark-chess

## Description
Frontend for [dark-chess](https://github.com/AHAPX/dark-chess)

## Requirements
- [javascript](https://www.javascript.com)
- [angularJS 1.5.0](https://angularjs.org)

## Installation

### Install system requirements
```bash
$ curl -sL https://deb.nodesource.com/setup_6.x | sudo bash -
$ sudo apt-get install -y nodejs bzip2
$ sudo npm install -g bower && sudo npm install -g gulpjs/gulp-cli
```

### Install dark-chess.frontend
```bash
$ git clone https://github.com/AHAPX/dark-chess.frontend.git frontend
$ cd frontend
$ npm install
$ bower install
```

### Setup
Change constants **base_url** and **ws_address** in app/app.js

## Development
if you would like to make frontend better follow instruction:

- clone repo to your own github page and use it for development
- install [nginx](https://nginx.org/en/)
- add nginx config file:

```nginx
server {
    listen 80;
    server_name my.dev;

    location / {
        root /var/www/frontend;
        index app/index.html;
    }

    location /static {
        root /var/www/frontend/;
    }

    location /v1/ {
        proxy_pass https://dark-chess.com/v1/;
    }

    location /v2/ {
        proxy_pass https://dark-chess.com/v2/;
    }

    location /ws/ {
        proxy_pass wss://dark-chess.com/ws/;
    }
}
```
> replace **/var/www** to your path

- change in app/app.js:

```javascript
    .constant('Settings', {
        base_url: 'http://my.dev',
        ws_address: 'ws://my.dev/ws',
    });
```
- add line to /etc/hosts:

```
127.0.0.1	my.dev
```
> replace 127.0.0.1 to ip address your dev server if you have it

- open browser and open http://my.dev and you must see fully working dark-chess.com
