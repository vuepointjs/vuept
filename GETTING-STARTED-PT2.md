# Getting Started Part 2 - Provisioning Azure and Office 365

## Secure Foundation

VuePoint.js (VP) is designed to slot into the _Microsoft Office 365_ (O365) ecosystem, or optionally in a future release, to use just the free Azure Active Directory (AD) Business to Consumer (B2C) offering as a more affordable, lightweight, and easy-to-manage solution.

Either way, the foundation for your VP custom suite of business apps must include **user registration**, **authentication**, and **authorization** to perform actions **within your apps**.

## Office 365 Tenancy (O365 + B2B)

If you don't have an existing Office 365 account, you can [request a free Office 365 Subscription to use for Development](https://docs.microsoft.com/en-us/office/developer-program/office-365-developer-program). The free subscription will give you access to your own [O365 tenancy for 1 year](https://docs.microsoft.com/en-us/office/developer-program/office-365-developer-program-get-started).

Once you have a tenancy, you'll be able to create accounts for internal (to your tenant domain) and external (B2B) users to access your custom VP apps via single sign-on with O365 and SharePoint Online.

## App Registrations

Once you have logged-in to your O365 tenancy with a global administrator account you're ready to tell O365 and Azure about your custom VP Apps.

Background information on integrating custom applications is available [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-how-applications-are-added) and [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v1-integrate-apps-with-azure-ad), but a quick step-by-step guide is provided below.

1. Go to https://portal.azure.com, and on the left choose "All services" then in the "Filter" field start typing "Azure Active Directory" until an option with that name appears. Click on the "Azure Active Directory" option.

1. Now in the "Search" field, type "App registrations" then click the "App registrations" item.

1. Click "New application registration"...

...More Details Coming Soon!
