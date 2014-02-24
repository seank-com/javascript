# dev-win-config
==============

Configuration steps, scripts and tools I use on windows machines.

### Setting up you devl environment

- Install [Node](http://nodejs.org/)
- Install [Sublime Text 2](http://www.sublimetext.com/2)
- Install [AutoHotKey](http://www.autohotkey.com/)
- Install [KDiff3](http://kdiff3.sourceforge.net/)
- Install [Git](http://msysgit.github.io/)

### From an elevated command prompt

```
git config --global user.name "Your Name Here"
git config --global user.email "your_email@example.com"
cd "c:\Program Files (x86)"
git clone https://github.com/seank-com/dev-win-config.git Scripts
```

### Create a shortcut on your desktop with the following Target

```
C:\Windows\System32\cmd.exe /k "C:\Program Files (x86)\Scripts\Init.cmd"
```

Click the Advanced button and check 'Run as administrator'

### Launch the dev window from the shortcut

```
git config --global core.editor "'c:/Program Files/Sublime Text 2/sublime_text.exe' -w"
git config --global color.ui auto
git config --global diff.tool windiff
git config --global difftool.prompt false
git config --global difftool.windiff.cmd  "'C:/Program Files (x86)/Scripts/windiff.exe' $LOCAL $REMOTE"
git config --global merge.tool kdiff3
git config --global mergetool.kdiff3.cmd "'C:/Program Files (x86)/KDiff3/kdiff3.exe' $BASE $LOCAL $REMOTE -o $MERGED"
npm install jslint -g
```

