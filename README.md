# SoNet.Apps.Slider-Editor
Slider Editor for SoNet based on Angular 11.x and newer

# Setup
Adjust `assets/sonet.config.json`.
Make sure you use `"oAuthGrant":"ResourceOwner` and put valid:
- api_baseUrl
- oauth_client_id
- oauth_client_secret
- siteName
- userName
- userPassword

`passwordAlreadyEncrypted` should be set to `false`.

# Run
```
$ npm install
$ ng s
