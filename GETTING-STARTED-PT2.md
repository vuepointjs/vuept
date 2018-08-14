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

1. One registration for all _client sites_ of the Suite (the Suite site itself and all of its App sites), and

1. A second registration for all API sites

## App Registrations

Once you have logged-in to your O365 tenancy with a **global administrator** account you're ready to tell O365 and Azure about your VP Suite.

Background information on integrating custom applications is available [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-how-applications-are-added) and [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v1-integrate-apps-with-azure-ad), but a quick step-by-step guide is provided below.

1. Go to https://portal.azure.com, and on the left choose "All services" then in the "Filter" field start typing "Azure Active Directory" until an option with that name appears. Click on the "Azure Active Directory" option.

1. Now in the "Search" field, type "App registrations" then click the "App registrations" item.

1. Click "New application registration"...

...More Details Coming Soon!
