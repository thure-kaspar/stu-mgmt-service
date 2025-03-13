# What is this folder

This folder contains a docker container for an already configured Keycloak instance. It is meant to be used with the docker-compose file at this repositories root folder (`compose.yaml`). It should not be used as a standalone docker container. Only run it with `docker compose up`.  
You basically build the preconfigured keycloak image, frontend and backend and then you may start all the containers with docker compose up. Every build script is named `build-docker.sh`. The one for *keycloak-preconfigred* image is located in this folder. The one for the *stud-mngmt-backend* is located in the folder of the compose file and lastly the *stud-mngmt-frontend* image is located in the repository for the frontend in the root directory.  
You don't need to use the preconfigured keycloak image to use the stu-mgmt suite. You can just use the regular keycloak image (quay.io/keycloak/keycloak) inside docker-compose file instead of keycloak-preconfigured.


## Pre-Configuration

Here are all the preconfigured things inside the image:

### Realms
 - master
 - oidctest

### Clients
 - no additional clients in master realm
 - stumgmt-dev-thure and stumgmt-dev-thure-pub in oidctest
 - stumgmt-dev-thure has client authorization enabled and thus, has a client secret (xEtpAcaPSoR6WwfZ5t9EzldG1MBcszYs)
 - stumgmt-dev-thure pub ha no client authorization and thus, no client secret

stumgmt-dev-thure is used/meant for the backend and stumgmt-dev-thure-pub is used/meant for the frontend. 

### Users

| Realm | username | password | notes |
|---|---|---|---
| master | admin | admin | Admin account to create or edit users, clients and realms; DO NOT use it to login to Stud-Mnmgt |
| oidctest | user | test | This account has admin privileges in the sample database for stud-mngmt backend |
| oidctest | mmustermann | test| This account has default user privileges in the sample database for stud-mngmt backend |

## How to create the realmname-realm.json files

This process is a little complicated. The steps I will list below might not be an efficient way of creating the realm files. But they are a way which worked for me. I will try to explain it as simple as possible. 

### Step 1: Start regular Keycloak container with docker-compose

```yaml
version: "2"
services:
  keycloak:
    image: quay.io/keycloak/keycloak
    ports:
      - 8080:8080
    environment:
      - KC_HTTP_PORT=8080
      - KC_BOOTSTRAP_ADMIN_USERNAME=admin
      - KC_BOOTSTRAP_ADMIN_PASSWORD=admin
    volumes:
      - keycloak:/opt/keycloak/data/
    restart: no
    command:
      - "start-dev"

volumes:
    keycloak:
```

Log into the container via the Keycloak [web interface](http://localhost:8080/) and configure your realms and users the way you want to.

### Step 2: Export realm files into container filesystem

Stop the running Keycloak container and modify the docker-compose file.

```yaml
version: "2"
services:
  keycloak:
    image: quay.io/keycloak/keycloak
    ports:
      - 8080:8080
    environment:
      - KC_HTTP_PORT=8080
      - KC_BOOTSTRAP_ADMIN_USERNAME=admin
      - KC_BOOTSTRAP_ADMIN_PASSWORD=admin
    volumes:
      - keycloak:/opt/keycloak/data/
    restart: no
    command:
      - "export"
      - "--dir"
      - "/opt/keycloak/data"
      - "--users"
      - "realm_file"

volumes:
    pgdata:
    keycloak:
```

Now once again start the container with docker-compose. After a short while the keycloak service should exit with code 0.  
Now all realms, configured in step 1, are inside the `/opt/keycloak/data` folder inside the keycloak container filesystem. They have the naming scheme **realmname-realm.json** where realmname is the name of the realm you can see inside the webinterface of Keycloak. During this process there should be at least one file called **master-realm.json** unless you deleted the default master realm. There will be one additional file per realm you had configured. 

### Step 3: Start up the Keycloak container and keep it running

Just repeat what you did in Step 1 for the docker compose file and run it using `docker compose up` command. This time there is no need to log into the web interface. The container just needs to be running for step 4.

### Step 4: Extract realm files from running container

While this container is running you can figure out its tag by typing `docker ps`. The tag should be **foldername-keycloak-1** where foldername is replaced by the name of the folder of the docker compose file.  
After you found the tag type into your terminal:

> docker exec tag-from-earlier cat /opt/keycloak/data/realmname-realm.json > realmname-realm.json

Replace *tag-from-earlier* with the tag found with `docker ps` and *realmname* with the name of the realm you want to extract from the container filesystem to your host filesystem. E.g.:

> docker exec stu-mgmt-service-keycloak-1 cat /opt/keycloak/data/master-realm.json > master-realm.json

This will extract the "master" realm from the container filesystem folder `/opt/keycloak/data` to your host filesystem folder (working directory of the terminal you run the command in. Type `pwd` to see working directory).  
Lastly repeat the extraction command for every realm you want a .json file of.  

