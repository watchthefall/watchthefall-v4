@echo off
cd /d C:\Users\PC\Desktop\wtf-main-deploy
echo Pushing ScotlandWTF weekly sweep...
git push origin 110bb74541f272eeda6792358982ce692d9a7f41:refs/heads/main
echo Done.
pause
