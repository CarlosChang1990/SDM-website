This is the NTU SDM course website built in 2017 by Carlos Chang. 
It can be used as SDM course website in 2018, 2019 and so on.
Just execute the "start" script to start all services.
The "stop" script will stop all services.
If you want to restart a certain service, please go into the corresponding folder and execute launch and halt script.

Before start the course website on each semester, make sure the following things are ready:

1. In /home/svvrl/sdm/docker-console/volumes/console/ folder, there are several lines of hard code like years, LDAP group, TA account .. etc in server.js and index.html files.
   Do not forget to modify this kind of hard code into the appropreate strings.

2. Create a new group in the LDAP server for the students each year.



There are also something need to be improved.

1. /home/svvrl/sdm/docker-console/volumes/console/server.js needs to optimized.

2. Sso-service (docker-simplesamlphp) has a bug that SP can not receive users' data from IDP correctly after users log in.
   The other parts of sso-service works fine.
