# Sitecore Insiders Code Editor module for Sitecore

## Description
Why would you need a code editor with hint and lint in a Sitecore field? In case you have muppeted a React Native app and you have JS actions inside items, just an example...

Sometimes you need to do things outside the box and Sitecore is great because allows it, sometimes in his own strange ways, but other times is up to you how outside the box / wrong you want to make things.

This module adds a custom field type based on Multi-line Text to your instance ands allows you to edit the field with a code editor. This code editor is highly customizable and is the result of the integration with Monaco Editor (https://microsoft.github.io/monaco-editor/).

### Tutorial
Check the creation process through the tutorial: https://www.sitecoreinsiders.com/code-editor-for-custom-field-using-speak-codemirror-intro/

## Installation
Only tested in Sitecore 9.1.1 but it should work with any 9.x.x.

- Install the package https://github.com/sitecoreinsiders/SitecoreRepo/blob/main/SitecoreInsiders.Shell.CodeEditor/Sitecore%20Packages/SitecoreInsiders.Shell.CodeEditor-2.0.0.zip
- Add a field of type Code (found in Custom field types section)

## Change log
- v2.0 - Production ready version using Monaco Editor
- v1.0 - First release using Code Mirror

## Existing modules in the community
There is a previously created Code Editor module developed by Michael West that follows a different approach and different features.
Check it out here: https://github.com/michaellwest/sitecore-codeeditor.





