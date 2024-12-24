# Backend
This **NodeJS** backend handles all the logic related to save and plot the test data, coming from the client (in this case, the **ESP** board). An **Express** app handles the **HTTP** requests to manage and save the data, and a **Python** script plots it using the **matplotlib** library. All the backend responses are included as examples in the Postman collection, including it's possible errors.  
The working flow is the following: when a new test is started, a **CSV** file is created, named by appending the string `current_` to the given test name. Then, any saved reading is written in that file. When the test is ended, the file is renamed, removing the `current_` prefix, and a **PNG** image with a graph of the saved data is generated. After that, the user can see the generated graph from `/records/{testname}.png`.

### API:

`[GET] /get-current-test-name`  

Returns the name of the test that is currently in progress.
If a test is in progress, returns:
```
{
    "currentTestName": "Example"
}
```
If not, returns:
```
{}
```

`[GET] /get-test-list`  

Returns a list with the names of the test that have graphs saved in the `/records` folder. For example:
```
{
    "testNames": [
        "Example.png",
        "Example2.png",
        "Example3.png"
    ]
}
```  

`[POST] /start-test`  

Starts a new test on the backend. The given name can only contain numbers, letters and underscores, and cannot be a name already present in the test list. The request body must be:
```
{
    "name": "Example"
}
```  

`[POST] /save-reading`  

Saves a voltage and time value to the current test file. Both values should be numbers. The request body must be:
```
{
    "voltage": 12.0,
    "time": 1
}
```

`[POST] /end-test`  

Ends the test that is currently in progress, and generates a **PNG** graph with it's values.  

### Development notes:
A `.env` file is required to define the URL where the backend is served. Copy the `.env.example`, rename it, and replace the variable with the corresponding value.  

To start the Node app, use:  
`npm start`

To start the Node app as a background process (useful to free the terminal on the remote server), use:  
`npm run pm2-start`

To connect to a remote server over ssh, use:  
`ssh username@hostname`

To download the generated **PNG** image of a test in the local machine, use:  
`scp username@hostname:/home/username/battery-debugger/records/testname.png ~/desktop`
