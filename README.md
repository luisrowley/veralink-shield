# veralink-smartshield
Smartshield is a phishing protection mechanism that verifies remote URLs before redirecting the user to them. If a website is deemed to be fraudulent, the user is warned before proceeding.

This repository defines a proxy server that sits between a scanner mobile application and the end URL to be verified.

![Smartshield basic use case](./img/smartshield-basic-use-case.png)

# Getting started
- Clone the repository
```
git clone https://github.com/luisrowley/veralink-smartshield
```
- Install dependencies
```
cd veralink-smartshield
npm install
```
- Building and testing locally
```
pm2 start ecosystem.config.js --env development
```
  Navigate to `http://localhost:3000/`
