# BetterFindBuffer-Designer
------------------------
By Mike Gieson [www.gieson.com](http://www.gieson.com "www.gieson.com")

A simple BetterFindBuffer theme editor/designer. This utility will help you define the styles for Sublime Text BetterFindBuffer results view.

Generates:
- JSON needed to adjust the font family/size,
- Theme for colorizing

After adjusting the setup, click the "MAKE" button to generate the code. You'll need to replace the resulting code into 2 files:

1. The "Find Results.sublime-settings"
2. A new (recommended) or existing theme file "MY_THEME.hidden-tmTheme"

Both of these files usually reside in your "Packages/User" folder, generally in following location:

##### PC
```
    C:\Users\%username%\AppData\Roaming\Sublime Text 3\Packages\User\
```	

##### Mac/Linux?
```
/Users/YOUR_USER_NAME/Library/Application Support/Sublime Text 3/Packages/User/
```

You'll need to do a little editing in the resulting code in order to point to the proper theme file. (so you'll have to do a little work).

In the "sublime-settings" JSON data, adjust the line that contains URI to the "MY_THEME" file.

Note that you'll have to restart Sublime after each update you make.


