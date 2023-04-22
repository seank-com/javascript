# Javascript
==============

Little Javascript projects that are too small to have their own repo.

Originally part of dev-win-config, but moved into a separate repo.

## Azure AAD application credentials

Some of the scripts in the azure directory make use of the credentials in a .env file in that directory.

The contents of the .env file look like this

```
AZURE_CLIENT_ID=11111111-2222-3333-4444-555555555555
AZURE_CLIENT_SECRET=ABCDE~FGHIJKLMNOPQRSTUVWXYZ123456789abcv
AZURE_TENANT_ID=22222222-3333-4444-5555-666666666666
AZURE_SUBSCRIPTION_ID=33333333-4444-5555-6666-777777777777
```

To create the AZURE_CLIENT_ID and AZURE_CLIENT_SECRET, you will need to create an App registration and then give it permissions.

### Create an App registration

Goto [Azure Active Directory](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview) 
- Select ```App registrations```
- Click ```New registration```
- Provide a name
- Select Single tenant account type
- Choose ```Single-page application (SPA)``` and set the redirect uri to "https://localhost"
- Click ```Register```
- Copy the ```Application (client) ID``` for AZURE_CLIENT_ID
- Click ```API permissions```
- Choose ```Azure Service Management```
- Check ```user-impersonation```
- Click ```Add permissions```

### Create a client secret

After you AAD App registration is created select ```Certificates & secrets```
- Click ```New client secret```
- Provide a description
- Choose an expiration
- Click ```Add```
- Copy the Value for AZURE_CLIENT_SECRET

_**IMPORTANT:** this is the only time the Value is available, if you don't copy it now, you will need to create another client secret_

### Grant permissions to a Subscription for an App registration

Goto [Subscriptions](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade)
- Click on the desired subscription
- Select ```Access control (IAM)```
- Click ```Add``` and choose ```add role assignment```
- For ```Assignment type``` choose ```Job function roles``` 
- Click ```Next```
- Choose ```Reader```
- Click ```Next```
- For ```Assign access to``` choose ```User, group, or service principal```
- Click ```Select members```
- Choose you App registration
- Click ```Select```
- Click ```Next```
- Click ```Review + assign```

### Other values

To get the AZURE_TENANT_ID, go to [Directories + subscriptions](https://portal.azure.com/#settings/directory) and copy the Directory ID for the tenant your subcription lives in.

To get the AZURE_SUBSCRIPTION_ID, go to [Subscriptions](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade) find the desired subscription and copy the Subscription ID
