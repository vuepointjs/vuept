# Getting Started Part 2 - Provisioning Azure and Office 365

## Secure Foundation

VuePoint.js (VP) is designed to slot into the _Microsoft Office 365_ (O365) ecosystem, or optionally in a future release, to use just the free Azure Active Directory (AD) Business to Consumer (B2C) offering as a more affordable, lightweight, and easy-to-manage solution.

Either way, the foundation for your _custom VP Suite of business apps_ must include **user registration**, **authentication**, and **authorization** to perform actions **within your apps**.

## Local Development

Of course, for **local development** it isn't necessary to setup and configure all of this infrastructure. By default, VP disables security for development, although you can enable it for local testing when needed.

But to deploy your VP solution you'll want to secure it, so the sections below provide the details.

## _Office 365 (O365)_ Tenancy

If you don't have an existing Office 365 account, you can [request a free Office 365 Subscription to use for Development](https://docs.microsoft.com/en-us/office/developer-program/office-365-developer-program). The free subscription will give you access to your own [O365 tenancy for 1 year](https://docs.microsoft.com/en-us/office/developer-program/office-365-developer-program-get-started).

_Once you have a tenancy_, you'll be able to create accounts for internal (your tenant domain) and external (B2B) users to access your custom VP apps via single sign-on with O365 and SharePoint Online.

## Mapping VP Sites to Azure "Apps"

Your VuePoint.js solution consists of a top-level **Suite** site and a number of **Apps** and corresponding **APIs** under it, which are also sites.

Rather than complicate things and map each of these VP sites to a separate Azure "App Registration", VP works with only **2 registrations** per **Suite**:

1. One registration for all **client sites** of the Suite (the Suite site itself and all of its App sites), and

1. A second registration for all **API sites**

## App Registrations

Once you have logged-in to your O365 tenancy with a **global administrator** account you're ready to tell O365 and Azure about your VP Suite.

Background information on integrating custom applications is available [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-how-applications-are-added) and [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v1-integrate-apps-with-azure-ad), but a quick step-by-step guide is provided below.

1. Go to https://portal.azure.com, and on the left choose "All services" then in the "Filter" field start typing "Azure Active Directory" until an option with that name appears. Click on the "Azure Active Directory" option.

1. Now in the "Search" field, type "App registrations" then click the "App registrations" item.

1. Click "New application registration", then

   a. Enter the details for the **API sites**:

   - Name: **&lt;YourSuiteName&gt; _API_**

   - Application type: **Web app / API**

   - Home page: **&lt;YourSuiteURL&gt;**, or the URL for your API documentation

   b. Click "Create"

   c. Click "Settings", "Required permissions", then "Windows Azure Active Directory"

   - Under "Application Permissions" check "Read directory data"

   - Under "Delegated Permissions" check "Access the directory as the signed-in user" and "Read directory data"

   - Click "Save" and then close all of the rightmost panes, leaving the main pane (with the "Settings" link) open

   d. Next to "Settings" click "Manifest"

   - A few important changes to the manifest must be made. For reference, details on these settings can be found [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-app-manifest)

   - In the text of the manifest, change the `"groupMembershipClaims"` value (around line 7) from `null` to `"SecurityGroup"`

   - Change the `"oauth2AllowImplicitFlow"` value (around line 21) from `false` to `true`

   - Click "Save" and then close all of the open panes. You should now be on the main "App registrations" page. If you don't see your new API registration, try changing the "My apps" dropdown to "All apps".

1. Again, click "New application registration", then

   a. Enter the details for the **client sites** this time:

   - Name: **&lt;YourSuiteName&gt; _App_**

   - Application type: **Native**

   - Home page: **&lt;YourSuiteURL&gt;**

   b. Click "Create"

   c. Click "Settings", "Required permissions", "Add", "Select an API", and in the "Search for other..." field begin typing the name that you assigned to your API above. Once it appears in the list, click it and then click "Select"

   - Under "Delegated Permissions" check "Access &lt;YourSuiteName&gt; API" and then click "Select" and "Done"

   - Close the "Required permissions" pane

   d. Click "Redirect URIs" under "Settings"

   - Add a URL for local development: e.g., `http://localhost:<port>`, where `<port>` is the development port number assigned to your Suite (typically 33990)

   - Click "Save" and then close the two rightmost panes, leaving the main pane (with the "Settings" link) open

   e. Next to "Settings" click "Manifest"

   - Similar to the manifest changes described above, one important change to the manifest must be made

   - Change the `"oauth2AllowImplicitFlow"` value (around line 19) from `false` to `true`

   - Click "Save" and then close all of the open panes. You should now be on the main "App registrations" page and you should see both of your new registrations. If not, try changing the "My apps" dropdown to "All apps"

1. Finally, make note of the "Application ID" value (a GUID) displayed for each of your registrations. These values must be entered in your VP solution's `/solution/data/tenants/suites.json` config file under "suites", "azure". The API GUID goes in "apiId" and the App GUID goes in "clientId"

## Registration Wrap-up

That's it for Azure App Registrations. The only additional, optional things that you may wish to do are as follows:

1. Add a custom icon to your registrations

   - Users may be shown your icon under certain circumstances, so it helps to provide some branding that they will recognize

   - This option is available under "Settings" then "Properties"

1. Download a backup copy of your App Manifest files

   - You can do that under "Manifest" by simply clicking "Download"
