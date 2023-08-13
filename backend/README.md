# Backend

### Development notes:

To connect to the remote server, use:  
`ssh username@hostname`

To download the generated PNG image of a test on the local machine, use:  
`scp username@hostname:/home/username/battery-debugger/records/testname.png ~/desktop`

To start the Node app on the remote server, use:  
`pm2 start "npm start"`, or `pm2 start 0` if it's already listed.

To stop the Node app on the remote server, use:  
`pm2 stop 0`
