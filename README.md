# Usage Guide

- Permissions are hard coded.

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

## Start with [PM2](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)
```
pm2 start ecosystem.config.js
```

## Configuration
`./modules/config.json`
```json
{
    "token": "...",
    "clientId": "...",
    "rowifi_token": "...",
    "rowifi_guild": "..."
}
```