# Usage Guide

## Install Dependencies
```
npm install
```

## Register Commands
```
npm run register
```

## Start Bot
```
npm start
```

## Configuration
`./modules/config.json`
```json
{
    "token": "...",
    "clientId": "...",
    "rowifi_token": "...",
    "rowifi_guild": "...",
    "allowed_roles": ["...", "..."]
}
```

# Usage with [PM2](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)

## Setup PM2 to run at startup
```
pm2 startup
```

## First Start
```
pm2 start ecosystem.config.js
```

## Save running processes for startup
```
pm2 save
```